import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-center items-center">
            Đăng Nhập Tài Khoản Của Bạn
          </CardTitle>
          {/* <CardDescription>
            Enter your email below to login to your account
          </CardDescription> */}
        </CardHeader>
        <CardContent>
          <form>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input id="email" type="email" placeholder="" />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Mật Khẩu</FieldLabel>
                </div>
                <Input id="password" type="password" />
              </Field>
              <Link
                href="#"
                className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
              >
                Quên Mật Khẩu ?
              </Link>
              <Field>
                <Button className="bg-amber-200 hover:disabled:*" type="submit">
                  Đăng Nhập
                </Button>
                <Button variant="outline" type="button">
                  Đăng Nhập Với Google
                </Button>
                <FieldDescription className="text-center">
                  Không Có Tài Khoản? <Link href="#">Đăng Ký</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
