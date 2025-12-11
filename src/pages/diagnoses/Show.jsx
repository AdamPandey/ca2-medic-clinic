import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "@/config/api";
import { formatForDisplay } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, FileText, User, Calendar, Pill } from "lucide-react";
import { useBreadcrumb } from "@/context/BreadcrumbContext"; // <--- Import
import { useLocation } from "react-router-dom";

export default function DiagnosisShow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [diagnosis, setDiagnosis] = useState(null);
  const [patient, setPatient] = useState(null);
  const [relatedPrescriptions, setRelatedPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setBreadcrumb } = useBreadcrumb(); // <--- Init
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Diagnosis
        const diagRes = await api.get(`/diagnoses/${id}`);
        setDiagnosis(diagRes.data);

        // 2. Fetch Patient Details
        const patRes = await api.get(`/patients/${diagRes.data.patient_id}`);
        setPatient(patRes.data);

        // 3. Fetch Prescriptions to see if any are linked to this diagnosis
        const presRes = await api.get('/prescriptions');
        const linked = presRes.data.filter(p => p.diagnosis_id === parseInt(id));
        setRelatedPrescriptions(linked);
        if (diagRes.data) {
            setBreadcrumb(location.pathname, diagRes.data.condition);
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
  if (!diagnosis) return <div className="p-10 text-center">Record not found</div>;

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/diagnoses')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
            <h1 className="text-3xl font-bold text-foreground">Diagnosis Details</h1>
            <p className="text-slate-500">Record ID: #{diagnosis.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Main Info */}
        <Card>
            <CardHeader className="bg-orange-50 border-b border-orange-100">
                <CardTitle className="text-orange-700 flex items-center gap-2">
                    <FileText className="h-5 w-5"/> {diagnosis.condition}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
                <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-slate-400" />
                    <div>
                        <p className="text-xs text-slate-500">Date Diagnosed</p>
                        <p className="font-medium">{formatForDisplay(diagnosis.diagnosis_date)}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-slate-400" />
                    <div>
                        <p className="text-xs text-slate-500">Patient</p>
                        <Link to={`/patients/${patient?.id}`} className="text-blue-600 hover:underline font-medium">
                            {patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown'}
                        </Link>
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* Related Treatments */}
        <Card>
            <CardHeader>
                <CardTitle>Linked Prescriptions</CardTitle>
            </CardHeader>
            <CardContent>
                {relatedPrescriptions.length === 0 ? (
                    <p className="text-slate-500 italic">No prescriptions linked to this condition.</p>
                ) : (
                    <div className="space-y-3">
                        {relatedPrescriptions.map(pres => (
                            <div key={pres.id} className="flex justify-between items-center p-3 border rounded bg-muted/0">
                                <div className="flex items-center gap-2">
                                    <Pill className="h-4 w-4 text-purple-500"/>
                                    <span className="font-medium">{pres.medication}</span>
                                </div>
                                <Link to={`/prescriptions/${pres.id}`}>
                                    <Badge variant="secondary" className="hover:bg-slate-200 cursor-pointer">View</Badge>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}