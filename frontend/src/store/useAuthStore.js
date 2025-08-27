// import { create } from "zustand";
// import { axiosInstance } from "../lib/axios.js";
// import toast from "react-hot-toast";
// import { io } from "socket.io-client";

// const BASE_URL =
//   import.meta.env.MODE === "development"
//     ? "http://localhost:5001"
//     : "https://talk-app-5xtb.onrender.com";

// export const useAuthStore = create((set, get) => ({
//   authUser: null,
//   isSigningUp: false,
//   isLoggingIn: false,
//   isUpdatingProfile: false,
//   isCheckingAuth: true,
//   onlineUsers: [],
//   socket: null,

//   checkAuth: async () => {
//     try {
//       const res = await axiosInstance.get("/auth/check");

//       set({ authUser: res.data });
//       get().connectSocket();
//     } catch (error) {
//       console.log("Error in checkAuth:", error);
//       set({ authUser: null });
//     } finally {
//       set({ isCheckingAuth: false });
//     }
//   },

//   signup: async (data) => {
//     set({ isSigningUp: true });
//     try {
//       const res = await axiosInstance.post("/auth/signup", data);
//       set({ authUser: res.data });
//       toast.success("Account created successfully");
//       get().connectSocket();
//     } catch (error) {
//       toast.error(error.response.data.message);
//     } finally {
//       set({ isSigningUp: false });
//     } 
//   },

//   login: async (data) => {
//     set({ isLoggingIn: true });
//     try {
//       const res = await axiosInstance.post("/auth/login", data);
//       set({ authUser: res.data });
//       toast.success("Logged in successfully");

//       get().connectSocket();
//     } catch (error) {
//       toast.error(error.response.data.message);
//     } finally {
//       set({ isLoggingIn: false });
//     }
//   },

//   logout: async () => {
//     try {
//       await axiosInstance.post("/auth/logout");
//       set({ authUser: null });
//       toast.success("Logged out successfully");
//       get().disconnectSocket();
//     } catch (error) {
//       toast.error(error.response.data.message);
//     }
//   },

//   updateProfile: async (data) => {
//     set({ isUpdatingProfile: true });
//     try {
//       const res = await axiosInstance.put("/auth/update-profile", data);
//       set({ authUser: res.data });
//       toast.success("Profile updated successfully");
//     } catch (error) {
//       console.log("error in update profile:", error);
//       toast.error(error.response.data.message);
//     } finally {
//       set({ isUpdatingProfile: false });
//     }
//   },

//   connectSocket: () => {
//     const { authUser } = get();
//     if (!authUser || get().socket?.connected) return;

//     const socket = io(BASE_URL, {
//       query: {
//         userId: authUser._id,
//       },
//     });
//     socket.connect();

//     set({ socket: socket });

//     socket.on("getOnlineUsers", (userIds) => {
//       set({ onlineUsers: userIds });
//     });
//   },
//   disconnectSocket: () => {
//     if (get().socket?.connected) get().socket.disconnect();
//   },
// }));
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { axiosInstance } from "../lib/axios";
import io from "socket.io-client";

// ✅ Correct BASE_URL setup for sockets
const BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5001"
    : "https://talk-app-5xtb.onrender.com";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      socket: null,

      // ✅ Register
      register: async (data) => {
        try {
          const res = await axiosInstance.post("/auth/register", data);
          set({ user: res.data, isAuthenticated: true });
          get().connectSocket();
        } catch (err) {
          console.error("Register Error:", err);
          throw err;
        }
      },

      // ✅ Login
      login: async (data) => {
        try {
          const res = await axiosInstance.post("/auth/login", data);
          set({ user: res.data, isAuthenticated: true });
          get().connectSocket();
        } catch (err) {
          console.error("Login Error:", err);
          throw err;
        }
      },

      // ✅ Logout
      logout: async () => {
        try {
          await axiosInstance.post("/auth/logout");
          set({ user: null, isAuthenticated: false });
          get().disconnectSocket();
        } catch (err) {
          console.error("Logout Error:", err);
          throw err;
        }
      },

      // ✅ Check authentication (for refreshing page)
      checkAuth: async () => {
        try {
          const res = await axiosInstance.get("/auth/check");
          set({ user: res.data, isAuthenticated: true });
          get().connectSocket();
        } catch (err) {
          console.error("Auth Check Error:", err);
          set({ user: null, isAuthenticated: false });
        }
      },

      // ✅ Connect socket.io
      connectSocket: () => {
        const { user, socket } = get();
        if (!user || socket) return;

        const newSocket = io(BASE_URL, {
          query: { userId: user._id },
          withCredentials: true,
        });

        set({ socket: newSocket });
      },

      // ✅ Disconnect socket
      disconnectSocket: () => {
        const { socket } = get();
        if (socket) {
          socket.disconnect();
          set({ socket: null });
        }
      },
    }),
    {
      name: "auth-storage", // LocalStorage key
      getStorage: () => localStorage,
    }
  )
);
