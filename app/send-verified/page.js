"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { sendVerificationEmail } from "@/lib/email";

export default function SendVerifiedPage() {
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    setLoading(true);
    try {
      const response = await sendVerificationEmail();
      if (response.error) {
        console.error(response);
        toast.error(response.error || response.message);
        setLoading(false);
        return;
      }
      console.log(response);
      toast.success(
        response.message ||
          "A verification link has been sent to your email address"
      );
    } catch (err) {
      console.error(err);
      toast.error("The verification email failed to be sent.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-2xl font-bold mb-4">Email Verification Required</h1>
      <p className="text-muted-foreground mb-6 max-w-md">
        Your email has not been verified yet. Please check your inbox and click
        the activation link. If you haven't received the email, you can resend
        it from here.
      </p>
      <Button
        onClick={handleResend}
        className="custom-button"
        disabled={loading}
      >
        {loading ? "Sending..." : "Resend Verification Link"}
      </Button>
    </div>
  );
}
