import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import DatePicker from "react-multi-date-picker";
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const formSchema = z.object({
  //   client_id: z.coerce.number().min(1, "client field is required."),
  //   account_number: z
  //     .string()
  //     .min(16, "Account Number must be at max 16 characters.")
  //     .max(16, "Account Number must be at max 16 characters")
  //     .regex(
  //       /^[A-Za-z0-9\s]+$/,
  //       "Account Number can only contain letters and numbers."
  //     ),
  //   have_demat_account: z
  //     .string()
  //     .min(1, "Account Number must be at max 16 characters."),

  //   service_provider: z
  //     .string()
  //     .min(1, "Service Provider field is required.")
  //     .max(100, "Service Provider must be at max 100 characters")
  //     .regex(/^[A-Za-z\s]+$/, "Service Provider can only contain letters."),
  client_id: z.coerce.number().optional(), // Make it optional
  account_number: z.string().optional(), // Make it optional
  have_demat_account: z.string().optional(),

  service_provider: z.string().optional(), // Make it optional
});

const Create = () => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const user = JSON.parse(localStorage.getItem("user"));
  const token = user.token;
  const navigate = useNavigate();
  const defaultValues = {
    client_id: "",
    account_number: "",
    service_provider: "",
    have_demat_account: "0",
  };

  const {
    data: allClientsData,
    isLoading: isAllClientsDataLoading,
    isError: isAllClientsDataError,
  } = useQuery({
    queryKey: ["all_clients"], // This is the query key
    queryFn: async () => {
      try {
        const response = await axios.get(`/api/all_clients`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        return response.data?.data; // Return the fetched data
      } catch (error) {
        throw new Error(error.message);
      }
    },
    keepPreviousData: true, // Keep previous data until the new data is available
  });

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
    setValue,
  } = useForm({ resolver: zodResolver(formSchema), defaultValues });

  const haveDemat = watch("have_demat_account");

  const storeMutation = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post("/api/demat_accounts", data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include the Bearer token
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries("demat_accounts");
      toast.success("Demat Account details Added Successfully");
      setIsLoading(false);
      navigate("/demat_accounts");
    },
    onError: (error) => {
      setIsLoading(false);
      if (error.response && error.response.data.errors) {
        const serverStatus = error.response.data.status;
        const serverErrors = error.response.data.errors;
        if (serverStatus === false) {
          if (serverErrors.account_number) {
            setError("account_number", {
              type: "manual",
              message: serverErrors.account_number[0], // The error message from the server
            });
            // toast.error("The poo has already been taken.");
          }
        } else {
          toast.error("Failed to add Demat Account details.");
        }
      } else {
        toast.error("Failed to add Demat Account details.");
      }
    },
  });
  const onSubmit = (data) => {
    setIsLoading(true);
    storeMutation.mutate(data);
  };

  useEffect(() => {
    // Ensure that the form is initialized with "0" for 'have_demat_account'
    if (!watch("have_demat_account")) {
      setValue("have_demat_account", "0");
    }
  }, [setValue, watch]);

  return (
    <>
      <div className="p-5">
        {/* breadcrumb start */}
        <div className=" mb-7 text-sm">
          <div className="flex items-center space-x-2 text-gray-700">
            <span className="">
              <Button
                onClick={() => navigate("/demat_accounts")}
                className="p-0 text-blue-700 text-sm font-light"
                variant="link"
              >
                Demat Accounts
              </Button>
            </span>
            <span className="text-gray-400">/</span>
            <span className="dark:text-gray-300">Add</span>
          </div>
        </div>
        {/* breadcrumb ends */}

        {/* form style strat */}
        <div className="px-5 pb-7 dark:bg-background pt-1 w-full bg-white shadow-lg border  rounded-md">
          <div className="w-full py-3 flex justify-start items-center">
            <h2 className="text-lg  font-normal">Add Demat Account Details</h2>
          </div>
          {/* row starts */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <Label className="font-normal" htmlFor="demat-yes">
              Have Demat Account <span className="text-red-500">*</span>
            </Label>
            <div className="w-full mb-5 grid grid-cols-1 md:grid-cols-10 gap-7 md:gap-4">
              <div className="relative flex gap-2 md:pt-3 md:pl-2 ">
                <Controller
                  name="have_demat_account"
                  control={control}
                  defaultValue={0}
                  render={({ field }) => (
                    <input
                      id="demat-no"
                      {...field}
                      type="radio"
                      value="0"
                      checked={field.value === "0"}
                      className="peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                    />
                  )}
                />
                <Label className="font-normal" htmlFor="demat-no">
                  No
                </Label>
                {errors.have_demat_account && (
                  <p className="absolute text-red-500 text-sm mt-1 left-0">
                    {errors.have_demat_account.message}
                  </p>
                )}
              </div>
              <div className="relative flex gap-2 md:pt-3 md:pl-2 ">
                <Controller
                  name="have_demat_account"
                  control={control}
                  render={({ field }) => (
                    <input
                      id="demat-yes"
                      {...field}
                      type="radio"
                      value="1"
                      checked={field.value === "1"}
                      className="peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                    />
                  )}
                />
                <Label className="font-normal" htmlFor="demat-yes">
                  Yes
                </Label>
                {errors.have_demat_account && (
                  <p className="absolute text-red-500 text-sm mt-1 left-0">
                    {errors.have_demat_account.message}
                  </p>
                )}
              </div>
            </div>
            {console.log(typeof haveDemat)}
            {haveDemat === "1" ? (
              <>
                <div className="w-full mb-5 grid grid-cols-1 md:grid-cols-2 gap-7 md:gap-4">
                  <div className="relative">
                    <Label className="font-normal" htmlFor="client_id">
                      Client: <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      name="client_id"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select Client" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Select Client</SelectLabel>
                              {allClientsData?.Clients &&
                                allClientsData?.Clients.map((client) => (
                                  <SelectItem value={String(client.id)}>
                                    {client.client_name}
                                  </SelectItem>
                                ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.client_id && (
                      <p className="absolute text-red-500 text-sm mt-1 left-0">
                        {errors.client_id.message}
                      </p>
                    )}
                  </div>
                  <div className="relative">
                    <Label className="font-normal" htmlFor="account_number">
                      Account Number:<span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      name="account_number"
                      control={control}
                      rules={{
                        required: "Account number field is required",
                        pattern: {
                          value: /^[0-9]{10}$/,
                          message: "Account number must be exact 16 digits",
                        },
                      }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="account_number"
                          className="mt-1"
                          type="text"
                          placeholder="Enter account number"
                          maxLength={16} // Enforce max length of 10 digits
                        />
                      )}
                    />
                    {errors.account_number && (
                      <p className="absolute text-red-500 text-sm mt-1 left-0">
                        {errors.account_number.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="w-full mb-2 grid grid-cols-1 md:grid-cols-2 gap-7 md:gap-4">
                  <div className="relative">
                    <Label className="font-normal" htmlFor="service_provider">
                      Service Provider:<span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      name="service_provider"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="service_provider"
                          className="mt-1"
                          type="text"
                          placeholder="Enter service provider"
                        />
                      )}
                    />
                    {errors.service_provider && (
                      <p className="absolute text-red-500 text-sm mt-1 left-0">
                        {errors.service_provider.message}
                      </p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              ""
            )}

            {/* row ends */}
            <div className="w-full gap-4 mt-4 flex justify-end items-center">
              <Button
                type="button"
                className="dark:text-white shadow-xl bg-red-600 hover:bg-red-700"
                onClick={() => navigate("/loans")}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isLoading}
                className=" dark:text-white  shadow-xl bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" /> {/* Spinner */}
                    Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Create;
