export type ParseOptions<ReadT, WriteT> = {
	/**
	 * A function to convert the written value to the expected read value.
	 *
	 * @param v - The value to parse.
	 * @returns The parsed value.
	 */
	parse?: (v: WriteT) => ReadT;
};
