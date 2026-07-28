import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Section } from "@/components/atoms/Section";
import { SigninForm } from "@/components/organisms/SigninForm";

export function SigninTemplate() {
  return (
    <Section className="flex flex-1 items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>로그인</CardTitle>
          <CardDescription>
            로그인 후 채팅 기능을 이용할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SigninForm />
        </CardContent>
      </Card>
    </Section>
  );
}
