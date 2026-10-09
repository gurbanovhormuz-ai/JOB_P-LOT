import Navbar from "@/components/navbar";
import MockInterview from "@/components/mock-interview";

export default function InterviewPage() {
  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <MockInterview />
    </div>
  );
}
