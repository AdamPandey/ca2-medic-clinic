import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/config/api";
import { Calendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import moment from 'moment';
import { toast } from "sonner";

// UI Components
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

export default function CalendarView() {
    const [events, setEvents] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ date: '', doctor_id: '', patient_id: '' });

    const navigate = useNavigate();
    const { theme } = useTheme();
    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [appRes, docRes, patRes] = await Promise.all([
                api.get('/appointments'), api.get('/doctors'), api.get('/patients')
            ]);

            setDoctors(docRes.data);
            setPatients(patRes.data);

            const formattedEvents = appRes.data.map(app => {
                const eventDate = new Date(app.appointment_date * 1000);
                if (isNaN(eventDate.getTime())) return null;

                return {
                    id: app.id,
                    title: `Dr. ${getPersonName(docRes.data, app.doctor_id)} w/ ${getPersonName(patRes.data, app.patient_id)}`,
                    start: eventDate,
                    end: moment(eventDate).add(1, 'hour').toDate(),
                    resource: { patientId: app.patient_id, doctorId: app.doctor_id },
                };
            }).filter(Boolean);

            setEvents(formattedEvents);
        } catch (e) {
            console.error(e); toast.error("Failed to load calendar data.");
        } finally {
            setLoading(false);
        }
    };

    const getPersonName = (list, id) => {
        const person = list.find(p => p.id === id);
        if (!person) return `ID #${id}`;
        return person.name || `${person.first_name} ${person.last_name}`;
    };

    const handleEventDrop = async ({ event, start }) => {
        const originalDateStr = moment(event.start).format("YYYY-MM-DD");
        const newDateStr = moment(start).format("YYYY-MM-DD");

        if (originalDateStr === newDateStr) {
            return;
        }

        const payload = { appointment_date: newDateStr };
        try {
            await api.patch(`/appointments/${event.id}`, payload);
            toast.success("Appointment rescheduled!");
            fetchData();
        } catch (e) {
            toast.error("Failed to reschedule.");
            fetchData();
        }
    };

    const handleSelectSlot = (slotInfo) => {
        resetForm();
        setFormData({ ...formData, date: moment(slotInfo.start).format("YYYY-MM-DD") });
        setIsEditing(false);
        setIsModalOpen(true);
    };
    
    const handleSelectEvent = (event) => {
        const originalAppointment = events.find(e => e.id === event.id);
        setFormData({
            id: originalAppointment.id,
            date: moment(originalAppointment.start).format("YYYY-MM-DD"),
            doctor_id: originalAppointment.resource.doctorId.toString(),
            patient_id: originalAppointment.resource.patientId.toString()
        });
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            appointment_date: formData.date,
            doctor_id: parseInt(formData.doctor_id),
            patient_id: parseInt(formData.patient_id)
        };
        try {
            if (isEditing) {
                await api.patch(`/appointments/${formData.id}`, payload);
                toast.success("Appointment updated");
            } else {
                await api.post('/appointments', payload);
                toast.success("Appointment booked");
            }
            setIsModalOpen(false); fetchData();
        } catch (e) { toast.error("Operation failed"); }
    };

    const resetForm = () => {
        setFormData({ date: '', doctor_id: '', patient_id: '' });
        setIsEditing(false);
    };

    if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin h-8 w-8"/></div>;

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">Clinic Schedule</h1>
            <div className="h-[75vh] bg-card p-4 rounded-md border text-foreground">
                <DnDCalendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    selectable
                    onSelectSlot={handleSelectSlot}
                    onSelectEvent={handleSelectEvent}
                    onEventDrop={handleEventDrop}
                    eventPropGetter={(event) => {
                        const colorIndex = (event.resource.doctorId || 0) % COLORS.length;
                        const style = {
                            backgroundColor: COLORS[colorIndex],
                            borderRadius: '5px', color: 'white', border: '0px', display: 'block', opacity: 0.8
                        };
                        return { style };
                    }}
                    className={theme === 'dark' ? 'rbc-dark' : ''}
                />
            </div>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Edit Appointment' : 'Book New Appointment'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-medium">Doctor</label>
                            <Select value={formData.doctor_id} onValueChange={(val) => setFormData({...formData, doctor_id: val})}>
                                <SelectTrigger><SelectValue placeholder="Select Doctor" /></SelectTrigger>
                                <SelectContent>{doctors.map(d => <SelectItem key={d.id} value={d.id.toString()}>{getPersonName(doctors, d.id)}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium">Patient</label>
                            <Select value={formData.patient_id} onValueChange={(val) => setFormData({...formData, patient_id: val})}>
                                <SelectTrigger><SelectValue placeholder="Select Patient" /></SelectTrigger>
                                <SelectContent>{patients.map(p => <SelectItem key={p.id} value={p.id.toString()}>{getPersonName(patients, p.id)}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium">Date</label>
                            <Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
                        </div>
                        <Button type="submit" className="w-full">{isEditing ? 'Update Appointment' : 'Confirm Booking'}</Button>
                        {isEditing && (
                            <div className="flex justify-between items-center pt-4 border-t">
                                <p className="text-sm">Quick Actions:</p>
                                {/* --- THE FIX IS HERE: Added type="button" --- */}
                                <Button type="button" variant="link" className="text-blue-600" onClick={() => navigate(`/patients/${formData.patient_id}`)}>View Patient Profile</Button>
                            </div>
                        )}
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}