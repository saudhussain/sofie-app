import { AdlibPanel } from '../components/AdlibPanel';
import { StatusBar } from '../components/StatusBar';

export function App() {
  return (
    <main className="flex min-h-full flex-col gap-3 p-4 md:p-6">
      <StatusBar />
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 md:grid-cols-2">
        <AdlibPanel
          headingId="adlibs-heading"
          title="Adlibs"
          emptyMessage="No adlibs yet."
        />
        <AdlibPanel
          headingId="global-adlibs-heading"
          title="Global Adlibs"
          emptyMessage="No global adlibs yet."
        />
      </div>
    </main>
  );
}
