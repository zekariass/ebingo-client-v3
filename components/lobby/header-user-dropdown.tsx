'use client';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Home,
    Key,
    LogOut,
} from "lucide-react"
import { Button } from "../ui/button";
import { logout } from "../auth/logout";
import { userStore } from "@/lib/stores/user-store";
import { useRouter } from "next/navigation";
import i18n from "@/i18n";


export default function HeaderUserDropdown() {
    const {user} = userStore();
    const router = useRouter()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="destructive"
                    className={`relative h-10 w-10 rounded-full hover:bg-gray-100`}
                >
                    <Avatar className="h-10 w-10">
                        {/* <AvatarImage src="/placeholder-user.png" alt="User" /> */}
                        <AvatarFallback className="bg-gray-200 text-gray-700 font-semibold">
                            {user?.firstName?.at(0) || "U"}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                className="w-56 rounded-lg shadow-md border"
                align="end"
                forceMount
            >
                <div className="flex items-center gap-2 p-3">
                    <div className="flex flex-col leading-none">
                        <p className="font-medium">{user?.firstName}</p>
                        {/* <p className="w-[200px] truncate text-sm text-muted-foreground">
                            {user?.email}
                        </p> */}
                    </div>
                </div>
                <DropdownMenuSeparator />
                {/* <DropdownMenuItem>
                    <Home className="mr-2 h-4 w-4" />
                    <span>Home</span>
                </DropdownMenuItem> */}
                {/* <DropdownMenuSeparator /> */}
                <DropdownMenuItem onClick={() => router.push(`/${i18n.language}/change-password`)} className="cursor-pointer">
                    <Key className="mr-2 h-4 w-4" />
                    <span>Change Password</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}