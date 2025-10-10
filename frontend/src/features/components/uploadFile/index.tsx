"use client";

import { useState } from "react";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/shadcn-io/dropzone";
import { cn } from "@/lib/utils";
import { CloudUploadIcon } from "@/assets/CustomIcons";
import type { FileRejection } from "react-dropzone";

interface UploadFileProps {
  accept?: { [key: string]: string[] };
  maxSize?: number;
  maxFiles?: number;
  className?: string;
  onFilesChange?: (files: File[]) => void;
}

const UploadFile = ({
  accept,
  maxSize,
  maxFiles = 1,
  className,
  onFilesChange,
}: UploadFileProps) => {
  const [file, setFile] = useState<File | null>(null);

  const handleDrop = (acceptedFiles: File[], fileRejections: FileRejection[]) => {
    if (fileRejections.length === 0 && acceptedFiles.length > 0) {
      const newFile = acceptedFiles[0];
      setFile(newFile);
      onFilesChange?.(acceptedFiles);
    }
  };

  const customEmptyContent = (
    <div
      className={cn(
        "flex flex-col items-center justify-center space-y-2",
        className
      )}
    >
      <CloudUploadIcon className="!w-6 !h-6 text-gray-600" />
      <p className="text-sm font-medium text-gray-600">
        <span className="underline hover:text-blue-600 cursor-pointer">
          Click to upload
        </span>{" "}
        or drag and drop
      </p>
    </div>
  );

  const customContent = file ? (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div className="flex items-center space-x-2">
        <CloudUploadIcon className="!w-6 !h-6 text-gray-600" />
        <p className="text-sm text-gray-700 truncate max-w-[180px]">{file.name}</p>
      </div>
      <p className="text-xs text-blue-600 underline cursor-pointer hover:text-blue-800">
        Replace file
      </p>
    </div>
  ) : null;

  return (
    <Dropzone
      accept={accept}
      maxFiles={maxFiles}
      maxSize={maxSize}
      onDrop={handleDrop}
      className={cn(
        "border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-gray-300 transition-colors bg-gray-50 min-h-[100px] flex items-center justify-center",
        className
      )}
      src={file ? [file] : undefined}
    >
      <DropzoneEmptyState>{customEmptyContent}</DropzoneEmptyState>
      <DropzoneContent>{customContent}</DropzoneContent>
    </Dropzone>
  );
};

export default UploadFile;
