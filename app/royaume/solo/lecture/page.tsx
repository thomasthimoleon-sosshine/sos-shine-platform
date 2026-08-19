import AmbientBackdrop from "@/components/royaume/AmbientBackdrop";
import SoloLecture from "@/components/royaume/SoloLecture";

export const metadata = { title: "Ta lecture" };

export default function SoloLecturePage() {
  return (
    <main className="relative">
      <AmbientBackdrop />
      <SoloLecture />
    </main>
  );
}
