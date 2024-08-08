'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from "@/utils/supabase/client";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
  Select,
  Heading,
} from '@chakra-ui/react';

interface ParkingSlot {
  slot_id: number;
  slot_floor: number;
  slot_name: string | null;
  slot_status: string | null;
}

const ManageSlots: React.FC = () => {
  const [parkingSlots, setParkingSlots] = useState<ParkingSlot[]>([]);
  const [formData, setFormData] = useState<any>({ slot_id: 0, slot_floor: 1, slot_name: '', slot_status: '' });
  const [editData, setEditData] = useState<ParkingSlot | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const supabase = createClient();

  useEffect(() => {
    fetchParkingSlots();
  }, []);

  const fetchParkingSlots = async () => {
    try {
      const { data, error } = await supabase.from('parking_space').select('*');
      if (error) {
        throw error;
      }
      if (data) {
        setParkingSlots(data);
      }
    } catch (error: any) {
      console.error('Error fetching parking slots:', error.message);
    }
  };

  const handleAdd = () => {
    setFormData({  slot_floor: 1, slot_name: '', slot_status: '' });
    onOpen();
  };

  const handleSubmit = async () => {
    try {
      if (editData) {
        const { data, error } = await supabase.from('parking_space').upsert([formData]);
        if (error) {
          throw error;
        }
      } else {
        const { data, error } = await supabase.from('parking_space').insert([formData]);
        if (error) {
          throw error;
        }
      }
      setFormData({ slot_id: 0, slot_floor: 1, slot_name: '', slot_status: '' });
      setEditData(null);
      onClose();
      fetchParkingSlots();
    } catch (error: any) {
      console.error('Error adding/editing parking slot:', error.message);
    }
  };

  const handleEdit = (slot: ParkingSlot) => {
    setFormData(slot);
    setEditData(slot);
    onOpen();
  };

  const handleDelete = async (slot: ParkingSlot) => {
    try {
      const { data, error } = await supabase.from('parking_space').delete().eq('slot_id', slot.slot_id);
      if (error) {
        throw error;
      }
      fetchParkingSlots();
    } catch (error: any) {
      console.error('Error deleting parking slot:', error.message);
    }
  };

  return (
    <div>
      <div className='flex flex-row justify-between px-16 py-8'> 
      <Heading size={'22'}>Manage Parking space</Heading> 
      <Button colorScheme='blue' onClick={handleAdd}>Add Parking Slot</Button>
      </div>
      <Table className='px-16'>
        <Thead> 
          <Tr>
            <Th>Slot ID</Th>
            <Th>Floor</Th>
            <Th>Name</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {parkingSlots.map((slot) => (
            <Tr key={slot.slot_id}>
              <Td>{slot.slot_id}</Td>
              <Td>{slot.slot_floor} Floor</Td>
              <Td>{slot.slot_name}</Td>
              <Td>
                <span className={`px-2 py-1 rounded-[5px] ${slot.slot_status === 'available' ? 'bg-green-800' : 'bg-red-800'} text-white`}>
                  {slot.slot_status}
                </span>
              </Td>
              <Td className='flex flex-row gap-2'>
                <Button onClick={() => handleEdit(slot)}>Edit</Button>
                <Button onClick={() => handleDelete(slot)}>Delete</Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bgColor={"#1a1a1a"}>
          <ModalHeader>{editData ? 'Edit Parking Slot' : 'Add Parking Slot'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody className='flex flex-col gap-8'>
            <Select placeholder="Floor" value={formData.slot_floor} onChange={(e) => setFormData({ ...formData, slot_floor: parseInt(e.target.value) })}>
              {[0, 1, 2, 3, 4].map((floor) => (
                <option key={floor} value={floor.toString()}>
                  {floor === 0 ? 'Ground' : `Floor ${floor}`}
                </option>
              ))}
            </Select>
            <Input placeholder="Name" value={formData.slot_name || ''} onChange={(e) => setFormData({ ...formData, slot_name: e.target.value })} />
            <Select placeholder="Status" value={formData.slot_status || ''} onChange={(e) => setFormData({ ...formData, slot_status: e.target.value })}>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
            </Select>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSubmit}>Save</Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );

};

export default ManageSlots;
