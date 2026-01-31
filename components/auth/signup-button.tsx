'use client';

import { Button } from "../ui/button";

export default function SignupButton() {
    return (
        <Button
            onClick={() => {
                window.location.href = "/signup";
            }}
            className="text-white px-4 py-2 rounded"
        >
            Register
        </Button>
    );
}