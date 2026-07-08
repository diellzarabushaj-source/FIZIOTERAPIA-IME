import { LegalPage } from "@/components/LegalPage";

export default function CameraConsentPage() {
  return (
    <LegalPage
      badge="Camera Consent"
      title="Pëlqimi për përdorimin e kamerës"
      intro="Kjo faqe shpjegon si përdoret kamera për AI Movement Check dhe çfarë duhet të dijë pacienti para se ta aktivizojë."
      sections={[
        {
          title: "1. Pse kërkohet kamera",
          body: "Kamera përdoret për të detektuar landmark-et e trupit gjatë ushtrimit dhe për të dhënë feedback mbi cilësinë e lëvizjes. Kamera aktivizohet vetëm kur pacienti e lejon në browser/app dhe klikon funksionin AI Movement Check.",
        },
        {
          title: "2. Çfarë analizohet",
          body: "Sistemi analizon pozicionet relative të trupit, stabilitetin, simetrinë dhe kontrollin e lëvizjes. Qëllimi është feedback për ushtrimin, jo identifikim personal, diagnozë apo vlerësim mjekësor i plotë.",
        },
        {
          title: "3. Ruajtja e të dhënave",
          body: "Versioni MVP ruan rezultatin e AI check, feedback-un, alert type dhe kohën e kontrollit. Videoja live përdoret për analizë në pajisje/browser dhe nuk ruhet si video klinike, përveç nëse më vonë shtohet funksion specifik me pëlqim të veçantë.",
        },
        {
          title: "4. Ambienti i sigurt",
          body: "Pacienti duhet të përdorë kamerën në ambient privat, me ndriçim të mirë dhe hapësirë të sigurt për lëvizje. Pacienti nuk duhet të filmojë persona të tjerë pa lejen e tyre.",
        },
        {
          title: "5. Refuzimi i kamerës",
          body: "Pacienti mund të mos e lejojë kamerën. Në këtë rast, ushtrimet dhe raportimi i dhimbjes mund të vazhdojnë pa AI Movement Check. Fizioterapeuti mund të japë udhëzime manuale.",
        },
      ]}
    />
  );
}
