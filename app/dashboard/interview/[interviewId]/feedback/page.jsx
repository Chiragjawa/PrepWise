"use client"
import { db } from '@/utils/db'
import { UserAnswer } from '@/utils/schema'
import { eq } from 'drizzle-orm'
import React, { useEffect, useState, useMemo } from 'react'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
  } from "@/components/ui/collapsible"
import { ChevronsUpDown, TrendingUp, BarChart3, PieChart, LineChart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import {
  LineChart as RechartsLineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

function Feedback({params}) {

    const [feedbackList,setFeedbackList]=useState([]);
    const router=useRouter();
    useEffect(()=>{
        GetFeedback();
    },[])
    const GetFeedback=async()=>{
        const result=await db.select()
        .from(UserAnswer)
        .where(eq(UserAnswer.mockIdRef,params.interviewId))
        .orderBy(UserAnswer.id);

        console.log(result);
        setFeedbackList(result);
    }

    // Parse rating from string format (e.g., "7/10" or "7" or "7.5")
    const parseRating = (ratingStr) => {
        if (!ratingStr) return 0;
        const match = ratingStr.toString().match(/(\d+\.?\d*)/);
        return match ? parseFloat(match[1]) : 0;
    }

    // Calculate analytics data
    const analyticsData = useMemo(() => {
        if (!feedbackList || feedbackList.length === 0) return null;

        // 1. Rating trend over questions (Line Chart)
        const ratingTrend = feedbackList.map((item, index) => ({
            question: `Q${index + 1}`,
            rating: parseRating(item.rating),
            fullQuestion: item.question.substring(0, 30) + '...'
        }));

        // 2. Rating distribution (Bar Chart)
        const ratingDistribution = {};
        feedbackList.forEach(item => {
            const rating = Math.floor(parseRating(item.rating));
            ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1;
        });
        const distributionData = Object.keys(ratingDistribution)
            .sort((a, b) => parseInt(a) - parseInt(b))
            .map(rating => ({
                rating: `${rating}-${parseInt(rating) + 1}`,
                count: ratingDistribution[rating]
            }));

        // 3. Performance by question (Bar Chart)
        const performanceData = feedbackList.map((item, index) => ({
            name: `Q${index + 1}`,
            rating: parseRating(item.rating),
            question: item.question.substring(0, 25) + '...'
        }));

        // 4. Overall statistics (Pie Chart)
        const avgRating = feedbackList.reduce((sum, item) => sum + parseRating(item.rating), 0) / feedbackList.length;
        const excellent = feedbackList.filter(item => parseRating(item.rating) >= 8).length;
        const good = feedbackList.filter(item => parseRating(item.rating) >= 6 && parseRating(item.rating) < 8).length;
        const needsImprovement = feedbackList.filter(item => parseRating(item.rating) < 6).length;
        
        const performanceStats = [
            { name: 'Excellent (8+)', value: excellent, color: '#00C49F' },
            { name: 'Good (6-8)', value: good, color: '#0088FE' },
            { name: 'Needs Improvement (<6)', value: needsImprovement, color: '#FF8042' }
        ];

        return {
            ratingTrend,
            distributionData,
            performanceData,
            performanceStats,
            avgRating: avgRating.toFixed(1),
            totalQuestions: feedbackList.length
        };
    }, [feedbackList]);

  return (
    <div className='p-10'>
        
        {feedbackList?.length==0?
        <h2 className='font-bold text-xl text-gray-500'>No Interview Feedback Record Found</h2>  
          :
        <>
       <h2 className='text-3xl font-bold text-green-500'>Congratulation!</h2>
        <h2 className='font-bold text-2xl'>Here is your interview feedback</h2>
       
        <h2 className='text-primary text-lg my-3'>
          Your overall interview rating: <strong>{analyticsData?.avgRating || '7'}/10</strong>
        </h2>
   
        {/* Analytics Dashboard */}
        {analyticsData && (
          <div className='mt-8 space-y-8'>
            <h2 className='text-2xl font-bold text-gray-800 flex items-center gap-2'>
              <BarChart3 className='h-6 w-6' />
              Performance Analytics
            </h2>

            {/* Grid of Charts */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              {/* 1. Confidence/Rating Trend Line Chart */}
              <div className='bg-white p-6 rounded-lg shadow-lg border border-gray-200'>
                <h3 className='text-lg font-semibold mb-4 flex items-center gap-2 text-gray-700'>
                  <LineChart className='h-5 w-5 text-blue-500' />
                  Rating Trend Over Questions
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart data={analyticsData.ratingTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="question" 
                      tick={{ fontSize: 12 }}
                      label={{ value: 'Question Number', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      domain={[0, 10]}
                      tick={{ fontSize: 12 }}
                      label={{ value: 'Rating', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className='bg-white p-3 border border-gray-300 rounded shadow-lg'>
                              <p className='font-semibold'>{payload[0].payload.fullQuestion}</p>
                              <p className='text-blue-600'>Rating: {payload[0].value}/10</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="rating" 
                      stroke="#0088FE" 
                      strokeWidth={3}
                      dot={{ r: 6, fill: '#0088FE' }}
                      activeDot={{ r: 8 }}
                      name="Rating"
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>

              {/* 2. Rating Distribution Bar Chart */}
              <div className='bg-white p-6 rounded-lg shadow-lg border border-gray-200'>
                <h3 className='text-lg font-semibold mb-4 flex items-center gap-2 text-gray-700'>
                  <BarChart3 className='h-5 w-5 text-green-500' />
                  Rating Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.distributionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="rating" 
                      tick={{ fontSize: 12 }}
                      label={{ value: 'Rating Range', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      label={{ value: 'Number of Questions', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className='bg-white p-3 border border-gray-300 rounded shadow-lg'>
                              <p className='font-semibold'>{payload[0].payload.rating}</p>
                              <p className='text-green-600'>Count: {payload[0].value}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                    <Bar dataKey="count" fill="#00C49F" radius={[8, 8, 0, 0]} name="Questions" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* 3. Performance by Question Bar Chart */}
              <div className='bg-white p-6 rounded-lg shadow-lg border border-gray-200'>
                <h3 className='text-lg font-semibold mb-4 flex items-center gap-2 text-gray-700'>
                  <TrendingUp className='h-5 w-5 text-purple-500' />
                  Performance by Question
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12 }}
                      label={{ value: 'Question', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      domain={[0, 10]}
                      tick={{ fontSize: 12 }}
                      label={{ value: 'Rating', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className='bg-white p-3 border border-gray-300 rounded shadow-lg'>
                              <p className='font-semibold'>{payload[0].payload.question}</p>
                              <p className='text-purple-600'>Rating: {payload[0].value}/10</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="rating" 
                      fill="#8884d8" 
                      radius={[8, 8, 0, 0]}
                      name="Rating"
                    >
                      {analyticsData.performanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={parseRating(entry.rating) >= 8 ? '#00C49F' : parseRating(entry.rating) >= 6 ? '#0088FE' : '#FF8042'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* 4. Overall Performance Pie Chart */}
              <div className='bg-white p-6 rounded-lg shadow-lg border border-gray-200'>
                <h3 className='text-lg font-semibold mb-4 flex items-center gap-2 text-gray-700'>
                  <PieChart className='h-5 w-5 text-orange-500' />
                  Overall Performance Breakdown
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={analyticsData.performanceStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analyticsData.performanceStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className='bg-white p-3 border border-gray-300 rounded shadow-lg'>
                              <p className='font-semibold'>{payload[0].name}</p>
                              <p className='text-gray-600'>Questions: {payload[0].value}</p>
                              <p className='text-gray-600'>
                                Percentage: {((payload[0].value / analyticsData.totalQuestions) * 100).toFixed(1)}%
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Summary Statistics Cards */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-6'>
              <div className='bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg shadow-lg text-white'>
                <h3 className='text-sm font-medium opacity-90'>Average Rating</h3>
                <p className='text-3xl font-bold mt-2'>{analyticsData.avgRating}/10</p>
              </div>
              <div className='bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg shadow-lg text-white'>
                <h3 className='text-sm font-medium opacity-90'>Total Questions</h3>
                <p className='text-3xl font-bold mt-2'>{analyticsData.totalQuestions}</p>
              </div>
              <div className='bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-lg shadow-lg text-white'>
                <h3 className='text-sm font-medium opacity-90'>Excellent Answers</h3>
                <p className='text-3xl font-bold mt-2'>
                  {analyticsData.performanceStats.find(s => s.name.includes('Excellent'))?.value || 0}
                </p>
              </div>
            </div>
          </div>
        )}

        <h2 className='text-sm text-gray-500 mt-8 mb-4'>Find below interview question with correct answer, Your answer and feedback for improvement</h2>
        {feedbackList&&feedbackList.map((item,index)=>(
            <Collapsible key={index} className='mt-7'>
            <CollapsibleTrigger className='p-2
             bg-secondary rounded-lg flex justify-between
            my-2 text-left gap-7 w-full hover:bg-secondary/80 transition-colors'>
            {item.question} <ChevronsUpDown className='h-5 w-5'/>
            </CollapsibleTrigger>
            <CollapsibleContent>
               <div className='flex flex-col gap-2'>
                <h2 className='text-red-500 p-2 border rounded-lg'><strong>Rating:</strong>{item.rating}</h2>
                <h2 className='p-2 border rounded-lg bg-red-50 text-sm text-red-900'><strong>Your Answer: </strong>{item.userAns}</h2>
                <h2 className='p-2 border rounded-lg bg-green-50 text-sm text-green-900'><strong>Correct Answer: </strong>{item.correctAns}</h2>
                <h2 className='p-2 border rounded-lg bg-blue-50 text-sm text-primary'><strong>Feedback: </strong>{item.feedback}</h2>
               
               </div>
            </CollapsibleContent>
            </Collapsible>
        ))}
 
  </>}
        
        <Button onClick={()=>router.replace('/dashboard')} className='mt-6'>Go Home</Button>
    </div>
  )
}

export default Feedback