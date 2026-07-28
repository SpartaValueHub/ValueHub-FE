"use client";

import { useActionState, useEffect, useRef } from "react";

import {
  sendChatMessageAction,
  type SendChatMessageActionState,
} from "@/actions/chat";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";

const initialState: SendChatMessageActionState = { ok: false };

interface ChatMessageFormProps {
  chatRoomUuid: string;
}

export function ChatMessageForm({ chatRoomUuid }: ChatMessageFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(
    sendChatMessageAction,
    initialState
  );

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
    }
  }, [state.ok]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-2 border-t pt-3"
    >
      <input type="hidden" name="chatRoomUuid" value={chatRoomUuid} />
      <input type="hidden" name="messageType" value="TEXT" />

      <div className="flex gap-2">
        <Input
          name="message"
          type="text"
          placeholder="메시지를 입력하세요"
          autoComplete="off"
          disabled={isPending}
          aria-invalid={!!state.fieldErrors?.message?.[0]}
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? "전송 중..." : "전송"}
        </Button>
      </div>

      {state.fieldErrors?.message?.[0] ? (
        <p className="text-sm text-destructive" role="status">
          {state.fieldErrors.message[0]}
        </p>
      ) : null}

      {!state.ok && state.message ? (
        <p className="text-sm text-destructive" role="status">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
