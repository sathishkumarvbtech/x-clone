import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { BsFillEyeFill } from "react-icons/bs";
import { FaUser } from "react-icons/fa";
import { MdPassword } from "react-icons/md";
import { RiEyeCloseFill } from "react-icons/ri";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import XSvg from "../../components/svgs/x";
import { baseUrl } from "../../constant/url";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [show, setShow] = useState(false);

  const handleShow = () => {
    setShow(!show);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const queryClient = useQueryClient();

  const {
    mutate: login,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: async ({ username, password }) => {
      try {
        const res = await fetch(`${baseUrl}/api/auth/login`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Login successfull!");
      queryClient.invalidateQueries({
        queryKey: ["authUser"],
      });
    },
  });

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    login(formData);
  };

  return (
    <>
      <div className="max-w-screen-xl mx-auto flex h-screen px-10">
        <div className="flex-1 hidden lg:flex items-center justify-center">
          <XSvg className="lg:w-2/3 fill-white" />
        </div>
        <div className="flex-1 flex flex-col justify-center items-center">
          <form
            className="lg:w-2/3 mx-auto md:mx-20 flex gap-4 flex-col"
            onSubmit={handleLoginSubmit}
          >
            <XSvg className="w-24 lg:hidden fill-white" />
            <h1>Login you account.</h1>
            <label className="input input-bordered rounded flex items-center gap-2">
              <FaUser />
              <input
                type="text"
                placeholder="Username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
              />
            </label>

            <label className="input input-bordered rounded flex items-center gap-2">
              <MdPassword />
              <input
                type={show ? "text" : "password"}
                placeholder="Password"
                className="grow"
                name="password"
                value={formData.value}
                onChange={handleInputChange}
              />
              {show ? (
                <RiEyeCloseFill
                  onClick={handleShow}
                  className="cursor-pointer  transition-all duration-300"
                />
              ) : (
                <BsFillEyeFill
                  onClick={handleShow}
                  className="cursor-pointer  transition-all duration-300"
                />
              )}
            </label>

            <button
              type="submit"
              className="btn rounded-full btn-primary text-white"
            >
              {isPending ? <LoadingSpinner /> : "Login"}
            </button>

            {isError && <p className="text-red-600">{error.message}</p>}
          </form>
          <div className="flex flex-col lg:w-2/3 gap-2 mt-4">
            <p>Don't have accont? click below</p>
            <Link to="/signup">
              <button className="btn rounded-full btn-primary text-white btn-outline w-full">
                Sign up
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
