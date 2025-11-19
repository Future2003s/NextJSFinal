"use client";
import React, { FormEvent } from "react";
import { LoginForm } from "@/components/login-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Calendar04 from "@/components/calendar-04";
import { Calendar } from "@/components/ui/calendar";
import Calendar21 from "@/components/calendar-21";

type InputForm = {
  email: string;
  password: string;
};

export const User = z.object({
  email: z.string().min(1, "Email Yêu Cầu Nhập").email("Email Không Hợp Lệ"),
  password: z.string().min(8, "Required 8 character"),
});

export type UserSchema = z.infer<typeof User>;

function Page() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InputForm>({
    resolver: zodResolver(User),
  });

  const handleData = (data: any) => {
    console.log(data);
  };

  console.log(errors);

  return (
    <div className="mt-25 h-[2000px] m-auto w-[1180px]">
      <div>
        <LoginForm className="p-10 w-2xl m-auto h-full" />
        <Calendar21 />
        <div className="mt-100">
          <div className="mt-[-200px] m-auto ">HOOK FORM</div>

          <form onSubmit={handleSubmit(handleData)} className="grid gap-x-2">
            <Label>Email:</Label>
            <Input
              {...register("email", {
                required: true,
              })}
            />

            {errors?.email?.message ?? (
              <p className="text-red-500">{errors.email?.message}</p>
            )}

            <Label>Password:</Label>
            <Input
              {...register("password", {
                required: true,
              })}
            />
            <Button type="submit">Submit</Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Page;
