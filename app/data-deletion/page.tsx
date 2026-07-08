import { LegalPage } from "@/components/LegalPage";

export default function DataDeletionPage() {
  return (
    <LegalPage
      badge="Data Deletion"
      title="Kërkesë për fshirjen e të dhënave"
      intro="Kjo faqe shpjegon si pacienti ose fizioterapeuti mund të kërkojë fshirje ose korrigjim të të dhënave."
      sections={[
        {
          title: "1. Kush mund të bëjë kërkesë",
          body: "Pacienti mund të kërkojë qasje, korrigjim ose fshirje të të dhënave të veta. Fizioterapeuti mund të kërkojë fshirje të llogarisë dhe të dhënave të lidhura me klinikën, varësisht nga detyrimet ligjore dhe kontraktuale.",
        },
        {
          title: "2. Si bëhet kërkesa",
          body: "Kërkesa bëhet duke kontaktuar administratorin në emailin zyrtar të platformës. Në MVP, adresa e kontaktit është diellzarabushaj@gmail.com. Kërkesa duhet të përmbajë emrin, rolin, arsyen dhe mënyrën e verifikimit të identitetit.",
        },
        {
          title: "3. Çfarë të dhënash mund të fshihen",
          body: "Mund të kërkohet fshirja e profilit, planeve, logs, pain scores, AI checks, mesazheve dhe notification logs. Disa të dhëna mund të mbahen për një periudhë të caktuar nëse kërkohet nga ligji, siguria ose evidenca klinike.",
        },
        {
          title: "4. Afati i trajtimit",
          body: "Administratori e shqyrton kërkesën dhe kthen përgjigje sa më shpejt. Për version final, afatet duhet të përcaktohen sipas rregullave të privatësisë në tregun ku platforma përdoret.",
        },
        {
          title: "5. Fshirje teknike",
          body: "Fshirja mund të bëhet si soft-delete ose hard-delete varësisht nga lloji i të dhënës dhe nevoja ligjore/klinike. Për siguri, çdo kërkesë duhet të verifikohet para se të ekzekutohet.",
        },
      ]}
    />
  );
}
