import axios from "axios";

export const fileApi = {
  uploadFileToS3: async (
    uploadUrl: string,
    file: File,
  ): Promise<void> => {
    const contentType = file.type;
    await axios.put(uploadUrl, file, {
      headers: {
        "Content-Type": contentType,
      },
    });
  },

  uploadFileWithPresignedInfo: async (
    file: File,
    getPresignedInfo: () => Promise<{ uploadUrl: string; fileName: string }>,
  ): Promise<string> => {
    const { uploadUrl, fileName } = await getPresignedInfo();
    await fileApi.uploadFileToS3(uploadUrl, file);
    return fileName;
  },
} as const;
