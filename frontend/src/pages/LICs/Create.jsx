import React, { useState } from "react";
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
  // devta_name: z.string().min(2, "Name must be at least 2 characters"),
  client_id: z.coerce.number().min(1, "client field is required."),
  company_name: z
    .string()
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name must be at max 100 characters")
    .regex(
      /^[A-Za-z\s\u0900-\u097F]+$/,
      "Company name can only contain letters."
    ),
  sum_insured: z.coerce
    .number()
    .min(1, "Sum Insured field is required")
    .max(99999999, "Sum Insured must not exceed 9,99,99,999"),
  broker_name: z
    .string()
    .min(2, "Broker name must be at least 2 characters")
    .max(100, "Broker name must be at max 100 characters")
    .regex(
      /^[A-Za-z\s\u0900-\u097F]+$/,
      "Broker name can only contain letters."
    ),
  proposal_date: z.string().min(1, "Proposal date field is required."),
  premium_payment_mode: z
    .string()
    .min(1, "Premium payment mode field is required.")
    .max(100, "Premium payment mode field must be at max 100 characters"),
  end_date: z.string().optional(),
});
const Create = () => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const user = JSON.parse(localStorage.getItem("user"));
  const token = user.token;
  const navigate = useNavigate();
  const defaultValues = {
    client_id: "",
    company_name: "",
    broker_name: "",
    proposal_date: "",
    company_name: "",
    premium_payment_mode: "",
    sum_insured: "",
    end_date: "",
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
    formState: { errors },
    setError,
  } = useForm({ resolver: zodResolver(formSchema), defaultValues });

  const storeMutation = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post("/api/lics", data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include the Bearer token
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries("lics");
      toast.success("LIC details Added Successfully");
      setIsLoading(false);
      navigate("/lics");
    },
    onError: (error) => {
      setIsLoading(false);
      if (error.response && error.response.data.errors) {
        const serverStatus = error.response.data.status;
        const serverErrors = error.response.data.errors;
        if (serverStatus === false) {
          if (serverErrors.company_name) {
            setError("company_name", {
              type: "manual",
              message: serverErrors.company_name[0], // The error message from the server
            });
            // toast.error("The poo has already been taken.");
          }
        } else {
          toast.error("Failed to add LIC details.");
        }
      } else {
        toast.error("Failed to add LIC details.");
      }
    },
  });
  const onSubmit = (data) => {
    setIsLoading(true);
    storeMutation.mutate(data);
  };

  return (
    <>
      <div className="p-5">
        {/* breadcrumb start */}
        <div className=" mb-7 text-sm">
          <div className="flex items-center space-x-2 text-gray-700">
            <span className="">
              <Button
                onClick={() => navigate("/lics")}
                className="p-0 text-blue-700 text-sm font-light"
                variant="link"
              >
                LICs
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
            <h2 className="text-lg  font-normal">Add LIC</h2>
          </div>
          {/* row starts */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="w-full mb-5 grid grid-cols-1 md:grid-cols-2 gap-7 md:gap-4">
              <div className="relative">
                <Label className="font-normal" htmlFor="client_id">
                  Client: <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="client_id"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
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
                <Label className="font-normal" htmlFor="company_name">
                  Company Name: <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="company_name"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="company_name"
                      className="mt-1"
                      type="text"
                      placeholder="Enter company name"
                    />
                  )}
                />
                {errors.company_name && (
                  <p className="absolute text-red-500 text-sm mt-1 left-0">
                    {errors.company_name.message}
                  </p>
                )}
              </div>
            </div>
            <div className="w-full mb-5 grid grid-cols-1 md:grid-cols-2 gap-7 md:gap-4">
              <div className="relative">
                <Label className="font-normal" htmlFor="broker_name">
                  Broker Name: <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="broker_name"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="broker_name"
                      className="mt-1"
                      type="text"
                      placeholder="Enter broker name"
                    />
                  )}
                />
                {errors.broker_name && (
                  <p className="absolute text-red-500 text-sm mt-1 left-0">
                    {errors.broker_name.message}
                  </p>
                )}
              </div>
              <div className="relative">
                <Label className="font-normal" htmlFor="proposal_date">
                  Proposal Date: <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="proposal_date"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      id="proposal_date"
                      className="dark:bg-[var(--foreground)] mt-1 text-sm w-full p-2 pr-3 rounded-md border border-1"
                      type="date"
                      placeholder="Enter to date"
                    />
                  )}
                />
                {errors.proposal_date && (
                  <p className="absolute text-red-500 text-sm mt-1 left-0">
                    {errors.proposal_date.message}
                  </p>
                )}
              </div>
            </div>
            <div className="w-full mb-5 grid grid-cols-1 md:grid-cols-2 gap-7 md:gap-4">
              <div className="relative">
                <Label className="font-normal" htmlFor="premium_payment_mode">
                  Premium Payment Mode:: <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="premium_payment_mode"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="mt-1">
                        <SelectValue className="" placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel className="">Select</SelectLabel>
                          <SelectItem value="Monthly">Monthly</SelectItem>
                          <SelectItem value="Quarterly">Quarterly</SelectItem>
                          <SelectItem value="Semi-Annual">
                            Semi-Annual
                          </SelectItem>
                          <SelectItem value="Annual">Annual</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.premium_payment_mode && (
                  <p className="absolute text-red-500 text-sm mt-1 left-0">
                    {errors.premium_payment_mode.message}
                  </p>
                )}
              </div>
              {/* <div className="relative">
                <Label className="font-normal" htmlFor="premium_payment_mode">
                  Premium Payment Mode: <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="premium_payment_mode"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="premium_payment_mode"
                      className="mt-1"
                      type="text"
                      placeholder="Enter mode"
                    />
                  )}
                />
                {errors.premium_payment_mode && (
                  <p className="absolute text-red-500 text-sm mt-1 left-0">
                    {errors.premium_payment_mode.message}
                  </p>
                )}
              </div> */}

              <div className="relative">
                <Label className="font-normal" htmlFor="sum_insured">
                  Sum Insured: <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="sum_insured"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="sum_insured"
                      className="mt-1"
                      type="number"
                      placeholder="Enter amount"
                    />
                  )}
                />
                {errors.sum_insured && (
                  <p className="absolute text-red-500 text-sm mt-1 left-0">
                    {errors.sum_insured.message}
                  </p>
                )}
              </div>
            </div>
            <div className="w-full mb-5 grid grid-cols-1 md:grid-cols-2 gap-7 md:gap-4">
              <div className="relative">
                <Label className="font-normal" htmlFor="end_date">
                  End Date:
                </Label>
                <Controller
                  name="end_date"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      id="end_date"
                      className="dark:bg-[var(--foreground)] mt-1 text-sm w-full p-2 pr-3 rounded-md border border-1"
                      type="date"
                      placeholder="Enter to date"
                    />
                  )}
                />
                {errors.end_date && (
                  <p className="absolute text-red-500 text-sm mt-1 left-0">
                    {errors.end_date.message}
                  </p>
                )}
              </div>
            </div>

            {/* row ends */}
            <div className="w-full gap-4 mt-4 flex justify-end items-center">
              <Button
                type="button"
                className="dark:text-white shadow-xl bg-red-600 hover:bg-red-700"
                onClick={() => navigate("/lics")}
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
