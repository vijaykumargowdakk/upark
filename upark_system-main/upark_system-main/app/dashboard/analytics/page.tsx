'use client'; 

import React, { useState, useEffect, Suspense } from 'react';
import { createClient } from "@/utils/supabase/client";
import { Box, Flex, Text, Stat, StatLabel, StatNumber, Heading } from '@chakra-ui/react';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const AnalyticsComponent = () => {
  const [tokens, setTokens] = useState([]);
  const supabase = createClient();

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
      }
    } catch (error) {
      console.error('Error fetching tokens:', error.message);
    }
  };

  // Prepare data for analytics
  const parkingDurations = tokens.map(token => {
    const entryTime = new Date(token.entry_time);
    const exitTime = token.exit_time ? new Date(token.exit_time) : new Date();
    return (exitTime.getTime() - entryTime.getTime()) / (1000 * 60 * 60); // in hours
  });

  // Pie chart data
  const parkingStatusCounts = tokens.reduce((acc, token) => {
    acc[token.parking_status ? 'Active' : 'Past'] += 1;
    return acc;
  }, { Active: 0, Past: 0 });

  const pieChartData = [
    { name: 'Active Parkings', value: parkingStatusCounts.Active },
    { name: 'Past Parkings', value: parkingStatusCounts.Past },
  ];

  // Line chart data (example)
  const lineChartData = tokens.map(token => ({ entry_time: new Date(token.entry_time), bill_amount: token.bill_amount || 0 }));

  // Scatter plot data (example)
  const scatterPlotData = tokens.map(token => ({ id: token.id, bill_amount: token.bill_amount || 0 }));

  return (
    <Box p={4} color="white">
    
        <Heading size='lg' className='p-4'>Business Analytics</Heading>
      {/* Numeric data cards */}
      <Flex className='flex flex-row gap-4 ' mb={4}>
        <Box p={4} className='min-w-[300px]' bgColor={'#222'} borderRadius="md" boxShadow="md">
          <Stat>
            <StatLabel>Total Parkings</StatLabel>
            <StatNumber>{tokens.length}</StatNumber>
          </Stat>
        </Box>
        <Box p={4} className='min-w-[300px]'   bgColor={'#222'} borderRadius="md" boxShadow="md">
          <Stat>
            <StatLabel>Total Revenue</StatLabel>
            <StatNumber>₹{tokens.reduce((acc, token) => acc + (token.bill_amount || 0), 0)}</StatNumber>
          </Stat>
        </Box>
        <Box className='min-w-[300px]'  p={4}  bgColor={'#222'} borderRadius="md" boxShadow="md">
          <Stat>
            <StatLabel>Average Parking Duration</StatLabel>
            <StatNumber>{parkingDurations.length > 0 ? (parkingDurations.reduce((acc, val) => acc + val, 0) / parkingDurations.length).toFixed(2) : 0} hours</StatNumber>
          </Stat>
        </Box>
        {/* Add more cards for other numeric data */}
      </Flex>

      {/* Analytics visualization section */}
      {/* Histogram of Parking Durations */}
      <Suspense  fallback = {<div>Loading...</div>}>
      <div className='flex flex-col '>
      <div className='flex flex-row gap-4'>

      <Box mb={8}  bgColor={'#222'} borderRadius="md" boxShadow="md" p={4}>
        <Text fontSize="xl" mb={4}>Line Chart of Revenue over Time</Text>
        <LineChart
          width={600}
          height={400}
          data={lineChartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <XAxis dataKey="entry_time" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="bill_amount" stroke="#48BB78" />
        </LineChart>
      </Box>

      <Box mb={8}  bgColor={'#222'} borderRadius="md" boxShadow="md" p={4}>
        <Text fontSize="xl" mb={4}>Histogram of Parking Durations</Text>
        <BarChart
          width={600}
          height={400}
          data={parkingDurations.map(d => ({ value: d }))}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#63B3ED" />
        </BarChart>
      </Box>

      {/* Pie chart of Parking Status */}
      
      </div>

      <div className='flex flex-row gap-4'>
      

      {/* Line chart of Revenue over Time */}
      <Box mb={8}  bgColor={'#222'} borderRadius="md" boxShadow="md" p={4}>
        <Text fontSize="xl" mb={4}>Pie Chart of Parking Status</Text>
        <PieChart width={600} height={400}>
          <Pie dataKey="value" isAnimationActive={false} data={pieChartData} cx={300} cy={200} outerRadius={80} fill="#F6AD55" label />
        </PieChart>
      </Box>
      

      {/* Scatter plot of Bill Amounts */}
      <Box mb={8}  bgColor={'#222'} borderRadius="md" boxShadow="md" p={4}>
        <Text fontSize="xl" mb={4}>Scatter Plot of Bill Amounts</Text>
        <ScatterChart
          width={600}
          height={400}
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <XAxis type="number" dataKey="id" name="ID" />
          <YAxis type="number" dataKey="bill_amount" name="Bill Amount" />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Legend />
          <Scatter name="Bill Amount" data={scatterPlotData} fill="#F6E05E" />
        </ScatterChart>
      </Box>
      </div>
      </div>
      </Suspense>
    </Box>
  );
};

export default AnalyticsComponent;
