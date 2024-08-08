"use client";
import React, { useEffect, useState } from 'react';
import { createClient } from "@/utils/supabase/client";
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Radio,
  RadioGroup,
  Button,
  Select,
  Heading,
  Stack,
} from '@chakra-ui/react';

interface Vehicle {
  registration: string;
  brand?: string;
  model?: string;
  color?: string;
  type?: string;
  customer_phone?: string;
  customer_email?: string;
  customer_name?: string;
}

const AddVehicleForm: React.FC = () => {
  const [formData, setFormData] = useState<Vehicle>({
    registration: '',
    brand: '',
    model: '',
    color: '',
    type: '',
    customer_phone: '',
    customer_email: '',
    customer_name: '',
  });
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      // Add vehicle details to the vehicle table

  
      // Search for an available slot in the parking_space table
      const { data: availableSlots, error: slotError } = await supabase.from('parking_space').select('*').eq('slot_status', 'available');
      if (slotError) {
        window.alert('All slots are booked!')
        throw slotError;
      }
  
      if (availableSlots.length > 0) {
        const { data: vehicleData, error: vehicleError } = await supabase.from('vehicle').insert([formData]);
        if (vehicleError) {
          window.alert('Vehicle already parked!');
  
          throw vehicleError;
        }
        console.log(availableSlots)
        const slotId = availableSlots[0].slot_id;
  
        // Update the slot status to 'occupied'
        await supabase.from('parking_space').update({ slot_status: 'occupied' }).eq('slot_id', slotId);
  
        // Add the slot_id to the vehicle table
        await supabase.from('vehicle').update({ slot_id: slotId }).eq('registration', formData.registration);
  
        // Add details to the token table
        const { data: tokenData, error: tokenError } = await supabase.from('token').insert({
          registration_no: formData.registration,
          customer_email: formData.customer_email,
          customer_name: formData.customer_name,
          slot_id: slotId,
          parking_status: true,
        });
        if (tokenError) {
          throw tokenError;
        }

        window.alert(`Parking slot successfully allocated!\nSlot ID: ${slotId}\nRegistration No: ${formData.registration}\nCustomer Name: ${formData.customer_name}\nCustomer Email: ${formData.customer_email}`);

        const response = await fetch("/api/email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: formData.customer_email,
            subject: `Parking Slot Allocated for your Vehicle`,
            text: `Your Parking Slot is allocated at Slot No: ${slotId}.\n\nDetails:\nRegistration No: ${formData.registration}\nBrand: ${formData.brand}\nModel: ${formData.model}\nColor: ${formData.color}\nType: ${formData.type}\nCustomer Name: ${formData.customer_name}\nCustomer Phone: ${formData.customer_phone}\nCustomer Email: ${formData.customer_email}\n`,
    from: "rvit21bis065.rvitm@rvei.edu.in",
          }),
        });

        if (response.ok) {
           window.alert("Email sent Successfully to customer");
        }
      }else{
        window.alert("No Slots Available");
      }
  
      // Clear the form data
      setFormData({
        registration: '',
        brand: '',
        model: '',
        color: '',
        type: '',
        customer_phone: '',
        customer_email: '',
        customer_name: '',
      });
    } catch (error) {
      console.error('Error adding vehicle:', error.message);
    }
  };
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const [vehicleType, setVehicleType] = useState<string>('');

  useEffect(() => {
    formData.type = vehicleType
  }, [vehicleType])
  return (
    <Box className='flex justify-center items-center flex-col gap-4 p-16 w-full'>
      <form onSubmit={handleSubmit} className='flex min-w-[800px] flex-col gap-2 bg-[#222] px-4  rounded'>
        <Heading className='text-center w-full text-sm pt-8 pb-6' >Park New Vehicle</Heading>

        <FormControl>
          <FormLabel>Customer Name</FormLabel>
          <Input type="text" placeholder='Customer Name' name="customer_name" value={formData.customer_name} onChange={handleChange} />
        </FormControl>

        <FormControl>
          <FormLabel>Customer Phone</FormLabel>
          <Input placeholder='+91 98765 43210' type="phone" name="customer_phone" value={formData.customer_phone} onChange={handleChange} />
        </FormControl>

        <FormControl>
          <FormLabel>Customer Email</FormLabel>
          <Input placeholder='Customer email' type="email" name="customer_email" value={formData.customer_email} onChange={handleChange} />
        </FormControl>


        <FormControl>
          <FormLabel>Registration Number</FormLabel>
          <Input placeholder='KA00XX0000' type="text" name="registration" value={formData.registration} onChange={handleChange} required />
        </FormControl>

        <FormControl>
          <FormLabel>Brand</FormLabel>
          <Input placeholder='Vehicle Brand' type="text" name="brand" value={formData.brand} onChange={handleChange} />
        </FormControl>

        <FormControl>
          <FormLabel>Model</FormLabel>
          <Input placeholder='Vehicle Model' type="text" name="model" value={formData.model} onChange={handleChange} />
        </FormControl>

        <FormControl>
          <FormLabel>Color</FormLabel>
          <Input placeholder='Vehicle Color' type="text" name="color" value={formData.color} onChange={handleChange} />
        </FormControl>

        <FormControl>
          <FormLabel >Type</FormLabel>
          <RadioGroup onChange={setVehicleType}  value={vehicleType}>
      <Stack direction='row'>
        <Radio value='2'>2 Wheeler</Radio>
        <Radio value='4'>4 Wheeler</Radio>
      </Stack>
    </RadioGroup>
        </FormControl>

   


        <Button type="submit" colorScheme={'blue'} className='my-6'>Add Vehicle</Button>
      </form>
    </Box>
  );
};

export default AddVehicleForm;
