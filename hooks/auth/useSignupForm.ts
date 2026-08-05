"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";

import { signupAction, type SignupActionState } from "@/actions/auth";
import {
  emptySignupFormValues,
  signupFormSchema,
  type SignupFormInput,
  type SignupInput,
} from "@/types/auth/signup";

const initialState: SignupActionState = { ok: false };

export function useSignupForm() {
  const [state, formAction, isPending] = useActionState(
    signupAction,
    initialState
  );

  const form = useForm<SignupFormInput>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: emptySignupFormValues,
    mode: "onChange",
  });

  const {
    control,
    getValues,
    setValue,
    setError,
    reset,
    handleSubmit,
    formState: { errors, touchedFields, isSubmitted },
  } = form;

  useEffect(() => {
    if (!state.values) return;
    reset(
      (current) => ({
        ...current,
        ...state.values,
      }),
      { keepErrors: true, keepDirty: true, keepTouched: true }
    );
  }, [state.values, reset]);

  useEffect(() => {
    if (!state.fieldErrors) return;
    (
      Object.entries(state.fieldErrors) as [
        keyof SignupFormInput,
        string[] | undefined,
      ][]
    ).forEach(([key, messages]) => {
      if (messages?.[0]) {
        setError(key, { type: "server", message: messages[0] });
      }
    });
  }, [state.fieldErrors, setError]);

  function getFieldError(name: keyof SignupFormInput): string | undefined {
    const serverError = state.fieldErrors?.[name as keyof SignupInput]?.[0];
    if (serverError) return serverError;
    if (!touchedFields[name] && !isSubmitted) return undefined;
    return errors[name]?.message;
  }

  function submitToAction(data: SignupFormInput, requestToken: string) {
    const formData = new FormData();
    formData.set("requestToken", requestToken);
    formData.set("logInId", data.logInId);
    formData.set("password", data.password);
    formData.set("passwordConfirm", data.passwordConfirm);
    formData.set("email", data.email);
    formData.set("name", data.name);
    formData.set("phone", data.phone);
    formAction(formData);
  }

  return {
    control,
    getValues,
    setValue,
    setError,
    getFieldError,
    handleSubmit,
    submitToAction,
    state,
    isPending,
  };
}
