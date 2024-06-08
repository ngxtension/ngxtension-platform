export type TransformOptions<ReadT, WriteT> = {
	/**
	 * A transformation function to convert the written value to the expected read value.
	 *
	 * @param v - The value to transform.
	 * @returns The transformed value.
	 */
	transform?: (v: WriteT) => ReadT;
};
