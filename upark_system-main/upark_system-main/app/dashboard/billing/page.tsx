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
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Heading,
} from '@chakra-ui/react';

interface Token {
  id: number;
  entry_time: string;
  exit_time: string | null;
  registration_no: string | null;
  bill_amount: number | null;
  customer_email: string | null;
  customer_name: string | null;
  slot_id: number | null;
  parking_status: boolean | null;
}

const AllParkings: React.FC = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const supabase = createClient();

  const [activeParkings, setActiveParkings] = useState<Token[]>([]);
  const [pastParkings, setPastParkings] = useState<Token[]>([]);

  useEffect(() => {
    fetchAllTokens();
  }, []);

  const fetchAllTokens = async () => {
    try {
      const { data, error } = await supabase.from('token').select('*');
      if (error) {
        throw error;
      }
      if (data) {
        setTokens(data);
        setActiveParkings(data.filter(token => token.parking_status));
        setPastParkings(data.filter(token => !token.parking_status));
      }
    } catch (error) {
      console.error('Error fetching tokens:', error.message);
    }
  };

  const handleExitVehicle = (token: Token) => {
    setSelectedToken(token);
    setModalIsOpen(true);
  };

  const handleCloseModal = () => {
    setModalIsOpen(false);
    setSelectedToken(null);
  };

  const handleConfirmExit = async () => {
    try {
      // Calculate bill amount
      const entryTime = new Date(selectedToken!.entry_time);
      const currentTime = new Date();
      const diffInHours = Math.ceil((currentTime.getTime() - entryTime.getTime()) / (1000 * 60 * 60));
      const billAmount = diffInHours * 20;

      // Update exit time, bill amount, and parking status
      await supabase.from('token').update({
        exit_time: currentTime,
        bill_amount: billAmount,
        parking_status: false
      }).eq('id', selectedToken!.id);

      
      const { error: vehicleError } = await supabase
      .from('vehicle')
      .delete()
      .eq('registration', selectedToken.registration_no);

      const { data, error: parkingError } = await supabase
      .from('parking_space')
      .update({ slot_status: 'available' })
      .eq('slot_id', selectedToken.slot_id)
      .select()
        
      // Close the modal
      handleCloseModal();

      const response = await fetch("/api/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: selectedToken!.customer_email,
          subject: `Thank you for parking with us!`,
          text: `Your vehicle was unparked from slot ${selectedToken!.slot_id} at ${currentTime}.\n\nDetails:\nRegistration No: ${selectedToken!.registration_no}\nCustomer Email: ${selectedToken!.customer_email}\nCustomer Name: ${selectedToken!.customer_name}\nBill Amount: ₹${billAmount}\n\nThank you for choosing UPark!`,
        from: "UPark",
        }),
      });

      if (response.ok) {
        window.alert("Email sent successfully to customer");
      }

    
      // Refresh token data
      fetchAllTokens();
    } catch (error) {
      console.error('Error confirming exit:', error.message);
    }
  };

  return (
    <div>
        <Heading size='md' className='p-6'>Manage Parkings</Heading>
     <Tabs>
      <TabList>
        <Tab>Active Parkings</Tab>
        <Tab>Past Parkings</Tab>
      </TabList>

      <TabPanels>
        <TabPanel>
          <Table >
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Entry Time</Th>
 
                <Th>Registration No</Th>
                <Th>Customer Email</Th>
                <Th>Customer Name</Th>
                <Th>Slot ID</Th>
               
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {activeParkings.map(token => (
                <Tr key={token.id}>
                  <Td>{token.id}</Td>
                  <Td>{new Date(token.entry_time).toLocaleString()}</Td>

                  <Td>{token.registration_no || '-'}</Td>
                  <Td>{token.customer_email || '-'}</Td>
                  <Td>{token.customer_name || '-'}</Td>
                  <Td>{token.slot_id || '-'}</Td>
                  
                  <Td>
                    {token.parking_status &&
                      <Button colorScheme={'red'} onClick={() => handleExitVehicle(token)}>Exit Vehicle</Button>
                    }
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TabPanel>
        <TabPanel>
          <Table >
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Entry Time</Th>
                <Th>Exit Time</Th>
                <Th>Registration No</Th>
                <Th>Customer Email</Th>
                <Th>Customer Name</Th>
                <Th>Slot ID</Th>
                <Th>Bill Collected</Th>
               
              </Tr>
            </Thead>
            <Tbody>
              {pastParkings.map(token => (
                <Tr key={token.id}>
                  <Td>{token.id}</Td>
                  <Td>{new Date(token.entry_time).toLocaleString()}</Td>
                  <Td>{token.exit_time ? new Date(token.exit_time).toLocaleString() : '-'}</Td>
                  <Td>{token.registration_no || '-'}</Td>
                  <Td>{token.customer_email || '-'}</Td>
                  <Td>{token.customer_name || '-'}</Td>
                  <Td>{token.slot_id || '-'}</Td>
                  <Td > <p className='text-green-700' >₹{token.bill_amount || '0'}</p></Td>
                 
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TabPanel>
      </TabPanels>
    </Tabs>

      <Modal isOpen={modalIsOpen} onClose={handleCloseModal}>
        <ModalOverlay />
        <ModalContent bgColor={"#1a1a1a"}>
          <ModalHeader>Exit Vehicle</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
             <p>Customer Name: {selectedToken?.customer_name}</p>
             <p> Vehicle No: {selectedToken?.registration_no}</p>
            <p>Current running fare: {selectedToken ? `₹${(Math.ceil((new Date().getTime() - new Date(selectedToken.entry_time).getTime()) / (1000 * 60 * 60))) * 20}` : ''}</p>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleConfirmExit}>Confirm Exit</Button>
            <Button onClick={handleCloseModal}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default AllParkings;
