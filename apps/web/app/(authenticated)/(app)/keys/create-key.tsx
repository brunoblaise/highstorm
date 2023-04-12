"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

import { trpc } from "@/lib/trpc";
import { CopyButton } from "@/components/copy-button";
import { Loading } from "@/components/loading";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {};

export const CreateKeyButton: React.FC<Props> = () => {
  const [loading, setLoading] = useState(false);
  const [key, setKey] = useState<string | null>(null);

  const { toast } = useToast();
  const router = useRouter();

  const snippet = `curl 'https://highstorm.app/api/v1/events/user.signup' \\
  -H 'Authorization: Bearer ${key}' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "event": "Chronark has signed up",
    "content": "A new user has signed up",
    "metadata": {"userId": "123"}
  }'
  `;

  return (
    <>
      <Button
        disabled={loading}
        onClick={async () => {
          try {
            setLoading(true);

            const created = await trpc.apikey.create.mutate({
              name: "default",
            });

            setKey(created.apiKey);
          } catch (e) {
            toast({
              title: "Error creating key",
              description: (e as Error).message,
              variant: "destructive",
            });
          } finally {
            setLoading(false);
          }
        }}
      >
        {loading ? <Loading /> : "Create Key"}
      </Button>
      <Dialog
        open={!!key}
        onOpenChange={(o) => {
          if (!o) {
            router.refresh();
            setKey(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Your API Key</DialogTitle>
            <DialogDescription>
              This key is only shown once and can not be recovered. Please store it somewhere safe.
            </DialogDescription>
            <div className="flex items-center justify-between gap-4 px-2 py-1 mt-8 rounded bg-neutral-100 dark:bg-neutral-800">
              <pre className="font-mono">{key}</pre>
              <CopyButton value={key!} />
            </div>
          </DialogHeader>

          <div className="flex items-center justify-between gap-4 px-2 py-1 mt-8 rounded bg-neutral-100 dark:bg-neutral-800">
            <pre className="font-mono">{snippet}</pre>
            <CopyButton value={snippet} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};