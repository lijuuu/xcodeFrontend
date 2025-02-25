import React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Github, Mail } from "lucide-react"
import { useNavigate } from "react-router-dom"

export function SignupForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className={cn("w-full max-w-md", className)} {...props}>
        <CardHeader className="space-y-1 px-4 py-3">
          <CardTitle className="text-xl font-bold">Sign Up</CardTitle>
          <CardDescription className="text-sm">Create a new account</CardDescription>
        </CardHeader>
        <CardContent className="px-4 py-3">
          <form className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="firstName" className="text-sm">First Name</Label>
                <Input id="firstName" type="text" placeholder="John" required className="h-9" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lastName" className="text-sm">Last Name</Label>
                <Input id="lastName" type="text" placeholder="Doe" required className="h-9" />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="email" className="text-sm">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" required className="h-9" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password" className="text-sm">Password</Label>
              <Input id="password" type="password" required className="h-9" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirmPassword" className="text-sm">Confirm Password</Label>
              <Input id="confirmPassword" type="password" required className="h-9" />
            </div>
            <Button type="submit" className="w-full h-9">
              Sign Up
            </Button>
          </form>

          <div className="mt-3 space-y-1">
            <Separator />
            <p className="text-center text-xs text-muted-foreground">Or continue with</p>
          </div>

          <div className="mt-3 flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
            <Button 
              variant="outline" 
              className="w-full h-8 text-xs px-2"
            >
              <Mail className="mr-1 h-3 w-3" />
              <span className="hidden sm:inline">Continue with Google</span>
              <span className="sm:hidden">Google</span>
            </Button>
            <Button 
              variant="outline" 
              className="w-full h-8 text-xs px-2"
            >
              <Github className="mr-1 h-3 w-3" />
              <span className="hidden sm:inline">Continue with GitHub</span>
              <span className="sm:hidden">GitHub</span>
            </Button>
          </div>

          <div className="mt-3 text-center text-xs">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="font-medium underline underline-offset-4 hover:text-primary"
            >
              Login
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}