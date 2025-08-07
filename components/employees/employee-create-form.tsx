"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RingLoader } from "react-spinners";
import { useCreateUser } from "@/hooks/use-employee-hooks";
import { CreateEmployeeInput } from "@/lib/types/employee";
import { CreateUserSchema } from "@/lib/validators/user";

export default function EmployeeCreateForm() {
  const createUserMutation = useCreateUser();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateEmployeeInput>({
    resolver: zodResolver(CreateUserSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      role: "EMPLOYEE",
    },
  });

  const onSubmit = (data: CreateEmployeeInput) => {
    createUserMutation.mutate(data);
  };

  const isLoading = createUserMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            {...register("username")}
            placeholder="Enter username"
            className={errors.username ? "border-red-500" : ""}
            disabled={isLoading}
          />
          {errors.username && (
            <p className="text-sm text-red-600">
              {errors.username.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            placeholder="Enter email address"
            className={errors.email ? "border-red-500" : ""}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-sm text-red-600">
              {errors.email.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          {...register("password")}
          placeholder="Enter password (min. 8 characters)"
          className={errors.password ? "border-red-500" : ""}
          disabled={isLoading}
        />
        {errors.password && (
          <p className="text-sm text-red-600">
            {errors.password.message}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Must contain uppercase, lowercase, and number
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select 
          value={watch("role")} 
          onValueChange={(value: "EMPLOYEE" | "FARM_MANAGER") => setValue("role", value)}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EMPLOYEE">Employee</SelectItem>
            <SelectItem value="FARM_MANAGER">Farm Manager</SelectItem>
          </SelectContent>
        </Select>
        {errors.role && (
          <p className="text-sm text-red-600">
            {errors.role.message}
          </p>
        )}
      </div>

      <div className="flex gap-4 pt-4">
        <Button 
          type="submit" 
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <RingLoader size={16} color="white" />
              Creating Employee...
            </div>
          ) : (
            "Create Employee"
          )}
        </Button>
      </div>
    </form>
  );
}
