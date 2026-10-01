import { StatusBar } from "../components/status-bar";
import { AdlibPanel } from "../features/adlibs/adlib-panel";
import {
	adLibPanelEmptyMessage,
	adLibsToDisplay,
} from "../features/adlibs/adlib-panels";
import { useLiveStatus } from "../hooks/use-live-status";

/**
 * Touch screen: connection lamp plus two adlib columns.
 * Part adlibs follow the content on air. Global adlibs stay with the rundown.
 */
export const App = () => {
	const connection = useLiveStatus();

	return (
		<main className="flex min-h-full flex-col gap-3 p-4 md:p-6">
			<StatusBar connection={connection} />
			<div className="grid min-h-0 flex-1 grid-cols-1 gap-3 md:grid-cols-2">
				<AdlibPanel
					adLibs={adLibsToDisplay(connection, "adLibs")}
					emptyStateMessage={adLibPanelEmptyMessage(connection, "adLibs")}
					headingId="adlibs-heading"
					title="Adlibs"
				/>
				<AdlibPanel
					adLibs={adLibsToDisplay(connection, "globalAdLibs")}
					emptyStateMessage={adLibPanelEmptyMessage(connection, "globalAdLibs")}
					headingId="global-adlibs-heading"
					title="Global Adlibs"
				/>
			</div>
		</main>
	);
};
