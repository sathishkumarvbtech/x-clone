import React, { useState } from "react";
import { MdOutlineMail } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { HiOutlinePencilAlt } from "react-icons/hi";
import { MdPassword } from "react-icons/md";
import XSvg from "../../components/svgs/x";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { baseUrl } from "../../constant/url";
import { toast } from "react-toastify";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { RiEyeCloseFill } from "react-icons/ri";
import { BsFillEyeFill } from "react-icons/bs";

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    fullname: "",
    password: "",
  });

  const [show, setShow] = useState(false);

  const handleShow = () => {
    setShow(!show);
  };

  const queryClient = useQueryClient();

  const {
    mutate: signUp,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: async ({ email, username, fullname, password }) => {
      try {
        const res = await fetch(`${baseUrl}/api/auth/signup`, {
          method: "post",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ email, username, fullname, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        console.log(data);
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log("User created");
      toast.success("User created successfully");
      queryClient.invalidateQueries({
        queryKey: ["authUser"],
      });
    },
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    signUp(formData);
  };

  return (
    <>
      <div className="max-w-screen-xl mx-auto flex h-screen px-10">
        <div className="flex-1 hidden lg:flex items-center justify-center ">
          <XSvg className="lg:w-2/3 fill-white" />
        </div>
        <div className="flex-1 flex flex-col justify-center items-center">
          <form
            className="lg:w-2/3 mx-auto md:mx-20 flex gap-4 flex-col"
            onSubmit={handleSignupSubmit}
          >
            <XSvg className="w-24 lg:hidden fill-white" />
            <h1 className="text-4xl text-white font-extrabold">Join today.</h1>

            <label className="input input-bordered rounded flex items-center gap-2">
              <MdOutlineMail />
              <input
                type="email"
                placeholder="Email"
                className="grow"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </label>

            <div className="flex gap-4 flex-wrap">
              <label className="input input-bordered rounded flex items-center gap-2 flex-1">
                <FaUser />
                <input
                  type="text"
                  placeholder="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                />
              </label>

              <label className="input input-bordered rounded flex items-center gap-2 flex-1">
                <HiOutlinePencilAlt />
                <input
                  type="text"
                  placeholder="Full Name"
                  className="grow"
                  name="fullname"
                  value={formData.value}
                  onChange={handleInputChange}
                />
              </label>
            </div>

            <label className="input input-bordered rounded flex items-center gap-2">
              <MdPassword />
              <input
                type={show ? "text" : "password"}
                placeholder="Password"
                className="grow"
                name="password"
                value={formData.password}
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
              {isPending ? <LoadingSpinner /> : "Sign up"}
            </button>

            {isError ? <p className="text-red-600">{error.message}</p> : ""}
          </form>
          <div className="flex flex-col lg:w-2/3 gap-2 mt-4">
            <p>Already have an account?</p>
            <Link to="/login">
              <button className="btn rounded-full btn-primary text-white btn-outline w-full">
                Sign in
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUpPage;
