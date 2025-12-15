import { useState, useEffect } from "react";
import axios from "@/config/api";

import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDownIcon } from "lucide-react";

export default function MoreFormExamples() {
  const [dobWindowOpen, setDobWindowOpen] = useState(false);
  const [performers, setPerformers] = useState([]);

  useEffect(() => {
    const fetchPerformers = async () => {
      const options = {
        method: "GET",
        url: "/performers",
      };

      try {
        let response = await axios.request(options);
        console.log(response.data);
        setPerformers(response.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchPerformers();
  }, []);

  const formSchema = z.object({
    department: z.enum([
      "Engineering",
      "Design",
      "Marketing",
      "Sales",
      "Customer Support",
    ]),
    dob: z.date("Date of Birth is required"),
    performer: z.string().min(1, "Performer is required"),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      department: "",
      dob: "",
      performer: "",
    },
    mode: "onChange",
  });

  const submitForm = (data) => {
    console.log(data);

    let formattedData = {
      ...data,
      dob: data.dob.toISOString().split("T")[0],
      performer_id: data.performer,
    };
    console.log("Formatted Data:");
    console.log(formattedData);
  };

  return (
    <Card className="w-full max-w-md mt-4">
      <CardHeader>
        <CardTitle>Various Form Examples</CardTitle>
      </CardHeader>
      <CardContent>
        <form id="form-demo-2" onSubmit={form.handleSubmit(submitForm)}>
          <div className="flex flex-col gap-6">
            <Controller
              name="department"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Department (Enums)</FieldLabel>
                  <Select
                    name={field.name}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <SelectTrigger aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Choose department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Customer Support">
                        Customer Support
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    Select your department or area of work.
                  </FieldDescription>
                </Field>
              )}
            />

            <Controller
              name="performer"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Select Performer (API data)</FieldLabel>
                  <Select
                    name={field.name}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <SelectTrigger aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Choose performer" />
                    </SelectTrigger>
                    <SelectContent>
                      {performers.map((performer) => (
                        <SelectItem key={performer.id} value={performer.id.toString()}>
                          {performer.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldDescription>Select your performer.</FieldDescription>
                </Field>
              )}
            />

            <Controller
              name="dob"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-example-dob">
                    Date of Birth
                  </FieldLabel>
                  <Popover open={dobWindowOpen} onOpenChange={setDobWindowOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        id="date"
                        className="w-48 justify-between font-normal"
                      >
                        {field.value
                          ? field.value.toLocaleDateString()
                          : "Select date"}
                        <ChevronDownIcon />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto overflow-hidden p-0"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={field.value}
                        captionLayout="dropdown"
                        onSelect={(selectedDate) => {
                          field.onChange(selectedDate);
                          setDobWindowOpen(false);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  <FieldDescription>Select your dob.</FieldDescription>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Field orientation="horizontal">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button variant="outline" type="submit" form="form-demo-2">
            Submit
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}
