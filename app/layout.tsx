import type { Metadata } from "next";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource-variable/manrope";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sava Beauty — салон красоты в Казани",
  description: "Sava Beauty — салон красоты в Казани: маникюр, педикюр, парикмахерские услуги, окрашивание волос, брови и ресницы, макияж и солярий.",
  openGraph: { title: "Sava Beauty — салон красоты в Казани", description: "Красота как спокойный ритуал заботы о себе.", type: "website", locale: "ru_RU" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const schema = { "@context": "https://schema.org", "@type": "BeautySalon", name: "Sava Beauty", telephone: "+7 (843) 203-33-66", address: { "@type": "PostalAddress", streetAddress: "ул. Адоратского, 1А", addressLocality: "Казань", addressCountry: "RU" } };
  return <html lang="ru"><body>{children}<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} /></body></html>;
}
