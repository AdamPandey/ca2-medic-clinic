import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "@/config/api";
import { formatForDisplay } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Pill, User, Stethoscope, FileText, CalendarClock } from "lucide-react";
import { useBreadcrumb } from "@/context/BreadcrumbContext"; // <--- Import
import { useLocation } from "react-router-dom";

export default function PrescriptionShow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null); // Will hold combined data
  const [loading, setLoading] = useState(true);
  const { setBreadcrumb } = useBreadcrumb(); // <--- Init hook
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Prescription
        const presRes = await api.get(`/prescriptions/${id}`);
        const prescription = presRes.data;

        // 2. Fetch All Related Entities in Parallel
        const [docRes, patRes, diagRes] = await Promise.all([
            api.get(`/doctors/${prescription.doctor_id}`),
            api.get(`/patients/${prescription.patient_id}`),
            api.get(`/diagnoses/${prescription.diagnosis_id}`)
        ]);

        setData({
            prescription,
            doctor: docRes.data,
            patient: patRes.data,
            diagnosis: diagRes.data
        });
        if (presRes.data) {
            setBreadcrumb(location.pathname, presRes.data.medication);
        }

      } catch (error) {
        console.error("Failed to fetch details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>;
  if (!data) return <div className="p-10 text-center">Record not found</div>;

  const { prescription, doctor, patient, diagnosis } = data;

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/prescriptions')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                <Pill className="h-8 w-8 text-purple-600"/> 
                {prescription.medication}
            </h1>
            <p className="text-slate-500">{prescription.dosage}</p>
        </div>
        <div className="ml-auto">
            <Badge variant={new Date(prescription.end_date) > new Date() ? "default" : "destructive"}>
                {new Date(prescription.end_date) > new Date() ? "Active" : "Expired"}
            </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Patient & Doctor Info */}
        <Card>
            <CardHeader>
                <CardTitle>Involved Parties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                        <User className="h-6 w-6 text-green-700" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-500 uppercase">Prescribed To</p>
                        <Link to={`/patients/${patient.id}`} className="text-lg font-semibold hover:underline text-slate-900">
                            {patient.first_name} {patient.last_name}
                        </Link>
                        <p className="text-sm text-slate-500">{patient.email}</p>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Stethoscope className="h-6 w-6 text-blue-700" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-500 uppercase">Prescribed By</p>
                        <Link to={`/doctors/${doctor.id}`} className="text-lg font-semibold hover:underline text-slate-900">
                            Dr. {doctor.last_name}
                        </Link>
                        <p className="text-sm text-slate-500">{doctor.specialisation}</p>
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* Medical Context */}
        <Card>
            <CardHeader>
                <CardTitle>Medical Context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-orange-100 rounded-lg">
                        <FileText className="h-6 w-6 text-orange-700" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-500 uppercase">Reason (Diagnosis)</p>
                        <Link to={`/diagnoses/${diagnosis.id}`} className="text-lg font-semibold hover:underline text-slate-900">
                            {diagnosis.condition}
                        </Link>
                        <p className="text-sm text-slate-500">Diagnosed: {formatForDisplay(diagnosis.diagnosis_date)}</p>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <div className="p-2 bg-slate-100 rounded-lg">
                        <CalendarClock className="h-6 w-6 text-slate-700" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-500 uppercase">Duration</p>
                        <p className="font-medium">
                            {formatForDisplay(prescription.start_date)} — {formatForDisplay(prescription.end_date)}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}