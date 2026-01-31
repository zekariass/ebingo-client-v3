'use client';

import { Button } from "../ui/button";

export default function LoginButton() {
    return (
        <Button
            onClick={() => {
                window.location.href = "/login";
            }}
            className="text-white px-4 py-2 rounded"
        >
            Login
        </Button>
    );
}