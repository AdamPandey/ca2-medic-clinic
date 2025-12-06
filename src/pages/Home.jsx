import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@/config/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { CloudSun, Activity, Users, CalendarCheck, ArrowUpRight, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatForDisplay } from '@/lib/utils';
import { toast } from "sonner";

export default function Home() {
  const [stats, setStats] = useState({ doctors: 0, patients: 0, appointments: 0 });
  const [weather, setWeather] = useState(null);
  const [specializations, setSpecializations] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [d, p, a] = await Promise.all([
          api.get('/doctors'), 
          api.get('/patients'), 
          api.get('/appointments')
        ]);
        
        setStats({ 
          doctors: d.data.length, 
          patients: p.data.length, 
          appointments: a.data.length 
        });

        // 1. Calculate Specialization Distribution for Pie Chart
        const specCount = {};
        d.data.forEach(doc => {
            const spec = doc.specialisation || "General";
            specCount[spec] = (specCount[spec] || 0) + 1;
        });
        const pieData = Object.keys(specCount).map(key => ({ name: key, value: specCount[key] }));
        setSpecializations(pieData);

        // 2. Get 5 most recent patients
        const recent = [...p.data].sort((a, b) => b.id - a.id).slice(0, 5);
        setRecentPatients(recent);

      } catch (e) { console.error(e); }
    };
    fetchData();

    // Dublin Weather
    fetch('https://api.open-meteo.com/v1/forecast?latitude=53.34&longitude=-6.26&current_weather=true')
      .then(res => res.json())
      .then(data => setWeather(data.current_weather));
  }, []);

  // --- NEW: Export CSV Function ---
  const downloadCSV = () => {
    if (recentPatients.length === 0) return toast.error("No data to export");

    // 1. Define headers
    const headers = ["ID", "First Name", "Last Name", "Email", "Phone", "DOB"];
    
    // 2. Format data rows
    const csvContent = [
      headers.join(","), // Header row
      ...recentPatients.map(p => [
        p.id, 
        `"${p.first_name}"`, // Quote strings to handle commas
        `"${p.last_name}"`, 
        p.email, 
        p.phone, 
        p.date_of_birth
      ].join(","))
    ].join("\n");

    // 3. Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "recent_patients_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Report downloaded successfully");
  };

  const chartData = [
    { name: 'Doctors', count: stats.doctors, color: '#3b82f6' },
    { name: 'Patients', count: stats.patients, color: '#10b981' },
    { name: 'Appts', count: stats.appointments, color: '#f59e0b' },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-6"
    >
      {/* Top Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Patients" value={stats.patients} icon={Users} color="text-green-500" />
        <StatCard title="Medical Staff" value={stats.doctors} icon={Activity} color="text-blue-500" />
        <StatCard title="Appointments" value={stats.appointments} icon={CalendarCheck} color="text-amber-500" />
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Dublin Weather</CardTitle>
                <CloudSun className="h-4 w-4 text-muted-foreground"/>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{weather ? `${weather.temperature}°C` : '...'}</div>
            </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Clinic Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                    cursor={{fill: 'transparent'}} 
                    contentStyle={{ 
                        backgroundColor: 'var(--card)', 
                        borderRadius: '8px', 
                        border: '1px solid var(--border)',
                        color: 'var(--card-foreground)' 
                    }}
                    itemStyle={{ color: 'var(--card-foreground)' }} 
                    labelStyle={{ color: 'var(--card-foreground)' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Staff Distribution</CardTitle>
            <CardDescription>Doctors by Specialization</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie data={specializations} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {specializations.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: 'var(--card)', 
                            color: 'var(--card-foreground)',
                            borderRadius: '8px', 
                            border: '1px solid var(--border)' 
                        }} 
                        itemStyle={{ color: 'var(--card-foreground)' }}
                    />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-1">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Recent Patients</CardTitle>
                    <CardDescription>Newest registrations in the system.</CardDescription>
                </div>
                {/* --- NEW: Export Button --- */}
                <Button variant="outline" size="sm" onClick={downloadCSV} className="hidden md:flex">
                    <Download className="mr-2 h-4 w-4"/> Export CSV
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {recentPatients.map(p => (
                        <div key={p.id} className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                            <div className="flex items-center gap-4">
                                <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-200 font-bold">
                                    {(p.first_name?.[0] || 'U')}{(p.last_name?.[0] || 'N')}
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">{p.first_name} {p.last_name}</p>
                                    <p className="text-xs text-muted-foreground">{p.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-sm text-muted-foreground hidden md:block">
                                    {formatForDisplay(p.date_of_birth)}
                                </div>
                                <Link to={`/patients/${p.id}`}>
                                    <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                                        View Profile <ArrowUpRight className="ml-1 h-3 w-3" />
                                    </Badge>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}