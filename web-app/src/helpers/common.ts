import type { AdLib, AdLibBase, AdLibsSnapshot, GlobalAdLib } from "../types";

// typeof null is "object", so null has to be rejected before any field is read.
const isJsonObject = (value: unknown): value is Record<string, unknown> =>
	typeof value === "object" && value !== null;

// A bad action type is skipped. The adlib itself can still be shown.
const parseActionTypes = (value: unknown): AdLibBase["actionType"] => {
	if (!Array.isArray(value)) {
		return [];
	}

	return value.flatMap((actionType) => {
		if (!isJsonObject(actionType)) {
			return [];
		}
		if (
			typeof actionType.name !== "string" ||
			typeof actionType.label !== "string"
		) {
			return [];
		}
		return [{ label: actionType.label, name: actionType.name }];
	});
};

const parseAdLibBase = (value: unknown): AdLibBase | null => {
	if (!isJsonObject(value)) {
		return null;
	}
	// No id means no stable list key. No name means nothing to show.
	if (typeof value.id !== "string" || typeof value.name !== "string") {
		return null;
	}

	return {
		actionType: parseActionTypes(value.actionType),
		id: value.id,
		name: value.name,
		// Missing sourceLayer still keeps the item. The list only renders the name.
		sourceLayer: typeof value.sourceLayer === "string" ? value.sourceLayer : "",
	};
};

const parsePartAdLib = (value: unknown): AdLib | null => {
	const base = parseAdLibBase(value);
	if (!(base && isJsonObject(value))) {
		return null;
	}
	// Part adlibs are tied to the content on air. No segment or part means drop it.
	if (typeof value.segmentId !== "string" || typeof value.partId !== "string") {
		return null;
	}

	return {
		...base,
		partId: value.partId,
		segmentId: value.segmentId,
	};
};

// Rundown-level actions have no segment or part. Do not require those here.
const parseGlobalAdLib = (value: unknown): GlobalAdLib | null =>
	parseAdLibBase(value);

/**
 * Turns one gateway message into the adlibs to show.
 * Ignores every event except `adLibs`. Returns null on a bad shape so the
 * previous lists stay up. Items missing an id or a name are left out.
 */
export const parseAdLibsMessage = (value: unknown): AdLibsSnapshot | null => {
	// The subscribe ack and other events are not a new snapshot.
	if (!isJsonObject(value) || value.event !== "adLibs") {
		return null;
	}
	if (!(Array.isArray(value.adLibs) && Array.isArray(value.globalAdLibs))) {
		return null;
	}

	const { rundownPlaylistId } = value;
	// Null means no rundown is active. Any other type is a payload we cannot trust.
	if (!(typeof rundownPlaylistId === "string" || rundownPlaylistId === null)) {
		return null;
	}

	return {
		adLibs: value.adLibs.flatMap((entry) => {
			const partAdLib = parsePartAdLib(entry);
			return partAdLib ? [partAdLib] : [];
		}),
		globalAdLibs: value.globalAdLibs.flatMap((entry) => {
			const globalAdLib = parseGlobalAdLib(entry);
			return globalAdLib ? [globalAdLib] : [];
		}),
		rundownPlaylistId,
	};
};
