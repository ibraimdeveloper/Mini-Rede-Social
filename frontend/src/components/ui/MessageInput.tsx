import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { IoSend, IoAttach, IoClose, IoDocument } from "react-icons/io5";
import { apiChat } from "../../utils/apiChat";

interface IMessageInput {
    id?: number;
    conversationId?: number;
    onSend?(message: string): void;
    onFileSent?(messageData: any): void;
}

const ALLOWED_EXTENSIONS = ["pdf", "jpeg", "jpg", "png", "pptx", "docx", "gif", "mp4"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

function getFilePreviewUrl(file: File): string | null {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (["jpeg", "jpg", "png", "gif"].includes(ext)) {
        return URL.createObjectURL(file);
    }
    return null;
}

export function MessageInput(props: IMessageInput) {
    const { t } = useTranslation();
    const { onSend, conversationId, onFileSent } = props;

    const [text, setText] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [isUploading, setIsUploading] = useState(false);
    const [fileError, setFileError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (!selected) return;

        setFileError(null);

        const ext = selected.name.split(".").pop()?.toLowerCase() ?? "";
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
            setFileError(`Extensão .${ext} não permitida.`);
            return;
        }
        if (selected.size > MAX_SIZE) {
            setFileError("Ficheiro demasiado grande (máx. 10MB).");
            return;
        }

        setFile(selected);
        setPreviewUrl(getFilePreviewUrl(selected));

        // reset input para permitir re-seleccionar o mesmo ficheiro
        e.target.value = "";
    };

    const removeFile = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setFile(null);
        setPreviewUrl(null);
        setFileError(null);
        setUploadProgress(0);
    };

    const handleSend = async () => {
        const trimmed = text.trim();

        if (!trimmed && !file) return;

        // Envio só de texto via WebSocket (comportamento original)
        if (!file && trimmed) {
            onSend?.(trimmed);
            setText("");
            return;
        }

        // Envio com ficheiro via REST
        if (!conversationId) return;

        const formData = new FormData();
        if (file) formData.append("file", file);
        if (trimmed) formData.append("content", trimmed);

        try {
            setIsUploading(true);
            setUploadProgress(0);

            const response = await apiChat.post(`/conversations/${conversationId}/upload/`, formData, {
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadProgress(pct);
                    }
                },
            });

            setText("");
            removeFile();
            onFileSent?.(response.data);
        } catch (err) {
            console.error("Erro ao enviar ficheiro:", err);
            setFileError("Erro ao enviar ficheiro. Tenta novamente.");
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            void handleSend();
        }
    };

    const isImage = previewUrl !== null;
    const ext = file?.name.split(".").pop()?.toLowerCase() ?? "";

    return (
        <div className="p-3 bg-white w-full border-t border-slate-200">

            {/* Preview do ficheiro */}
            {file && (
                <div className="mb-2 flex items-center gap-3 bg-[#F5F6FA] rounded-[12px] p-2 border border-slate-200">
                    {isImage ? (
                        <img
                            src={previewUrl!}
                            alt="preview"
                            className="w-12 h-12 rounded-[8px] object-cover flex-shrink-0"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-[8px] bg-[#ec4348]/10 flex items-center justify-center flex-shrink-0">
                            <IoDocument className="text-[#ec4348] text-xl" />
                        </div>
                    )}
                    <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-[13px] font-medium text-slate-700 truncate">
                            {file.name}
                        </span>
                        <span className="text-[11px] text-slate-400">
                            {(file.size / 1024).toFixed(1)} KB · .{ext.toUpperCase()}
                        </span>

                        {/* Barra de progresso */}
                        {isUploading && (
                            <div className="mt-1.5 w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                <div
                                    className="bg-[#ec4348] h-1.5 rounded-full transition-all duration-200"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                        )}
                        {isUploading && (
                            <span className="text-[11px] text-slate-400 mt-0.5">
                                A enviar... {uploadProgress}%
                            </span>
                        )}
                    </div>

                    {!isUploading && (
                        <button
                            type="button"
                            onClick={removeFile}
                            className="text-slate-400 hover:text-slate-600 transition flex-shrink-0 p-1"
                        >
                            <IoClose className="text-lg" />
                        </button>
                    )}
                </div>
            )}

            {/* Erro */}
            {fileError && (
                <p className="text-[12px] text-red-500 mb-2 px-1">{fileError}</p>
            )}

            {/* Input principal */}
            <div className="bg-[#F5F6FA] p-3 rounded-[14px] gap-2 flex flex-col sm:flex-row border border-transparent">

                {/* Botão de anexo */}
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="text-slate-400 hover:text-[#ec4348] transition p-1 flex-shrink-0 disabled:opacity-50"
                    title="Anexar ficheiro"
                >
                    <IoAttach className="text-[22px]" />
                </button>

                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept={ALLOWED_EXTENSIONS.map((e) => `.${e}`).join(",")}
                    onChange={handleFileChange}
                />

                <input
                    type="text"
                    placeholder={t("chat.messageInput.placeholder")}
                    className="p-1 outline-none text-[14px] flex-1 min-w-0 bg-transparent text-slate-800 placeholder:text-slate-500"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isUploading}
                />

                <button
                    type="button"
                    onClick={() => void handleSend()}
                    disabled={isUploading || (!text.trim() && !file)}
                    className="bg-[#ec4348] p-2 text-white rounded-[10px] flex justify-center items-center gap-2 text-[14px] font-bold whitespace-nowrap transition w-full sm:w-auto sm:min-w-25 hover:bg-[#d93b40] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <IoSend /> {isUploading ? `${uploadProgress}%` : t("chat.messageInput.send")}
                </button>
            </div>
        </div>
    );
}