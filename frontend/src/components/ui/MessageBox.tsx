import { useState, useRef, useEffect } from "react";
import {
    IoDocument, IoDownload, IoEye, IoClose,
    IoChevronDown, IoTrash, IoCheckmark,
} from "react-icons/io5";
import { apiChat } from "../../utils/apiChat";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface I {
    message   : string;
    forMe     : boolean;
    time      : string;
    fileUrl  ?: string | null;
    fileName ?: string | null;
    messageId : number;
    isRead    : boolean;
    onDeleted : (id: number) => void;
}

type DeleteScope = "for_me" | "for_everyone";

// ─── Indicador de leitura (✓ enviado / ✓✓ lido) ──────────────────────────────

function ReadIndicator({ isRead }: { isRead: boolean }) {
    return (
        <span
            className={`flex items-center self-end mb-0.5 transition-colors duration-300 ${
                isRead ? "text-white" : "text-white/40"
            }`}
            title={isRead ? "Lido" : "Enviado"}
        >
            {/* Primeiro visto */}
            <IoCheckmark className="text-[13px] -mr-[5px]" />
            {/* Segundo visto — só aparece quando lido */}
            <IoCheckmark
                className={`text-[13px] transition-opacity duration-300 ${
                    isRead ? "opacity-100" : "opacity-0"
                }`}
            />
        </span>
    );
}

// ─── Preview Modal ────────────────────────────────────────────────────────────

function PreviewModal({
    url,
    fileName,
    onClose,
}: {
    url      : string;
    fileName : string;
    onClose  : () => void;
}) {
    const ext     = fileName.split(".").pop()?.toLowerCase() ?? "";
    const isImage = ["jpeg", "jpg", "png", "gif"].includes(ext);
    const isPdf   = ext === "pdf";
    const isVideo = ext === "mp4";

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative bg-white rounded-[16px] shadow-2xl max-w-[90vw] max-h-[90vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
                    <span className="text-[13px] font-medium text-slate-700 truncate max-w-[300px]">
                        {fileName}
                    </span>
                    <button
                        onClick={onClose}
                        className="ml-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-500 transition"
                    >
                        <IoClose className="text-lg" />
                    </button>
                </div>

                <div className="flex-1 overflow-auto p-2 flex items-center justify-center min-h-[200px]">
                    {isImage && (
                        <img
                            src={url}
                            alt={fileName}
                            className="max-w-full max-h-[75vh] object-contain rounded-[8px]"
                        />
                    )}
                    {isPdf && (
                        <iframe
                            src={url}
                            className="w-[80vw] h-[75vh] rounded-[8px]"
                            title={fileName}
                        />
                    )}
                    {isVideo && (
                        <video
                            src={url}
                            controls
                            className="max-w-full max-h-[75vh] rounded-[8px]"
                        />
                    )}
                    {!isImage && !isPdf && !isVideo && (
                        <div className="flex flex-col items-center gap-3 p-8 text-slate-500">
                            <IoDocument className="text-5xl text-slate-400" />
                            <p className="text-[14px]">Pré-visualização não disponível</p>
                            <p className="text-[12px] text-slate-400">
                                Faz download para abrir o ficheiro
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Hook de download via fetch (sem abrir nova aba) ──────────────────────────

function useFileDownload() {
    const [downloading, setDownloading] = useState(false);
    const [blobUrl, setBlobUrl]         = useState<string | null>(null);

    const download = async (fileUrl: string, fileName: string): Promise<string | null> => {
        if (blobUrl) {
            triggerSave(blobUrl, fileName);
            return blobUrl;
        }
        try {
            setDownloading(true);
            const token    = localStorage.getItem("authToken");
            const response = await fetch(fileUrl, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            if (!response.ok) throw new Error("Falha no download");
            const blob = await response.blob();
            const url  = URL.createObjectURL(blob);
            setBlobUrl(url);
            triggerSave(url, fileName);
            return url;
        } catch (err) {
            console.error("Erro no download:", err);
            return null;
        } finally {
            setDownloading(false);
        }
    };

    return { downloading, blobUrl, download };
}

function triggerSave(blobUrl: string, fileName: string) {
    const a         = document.createElement("a");
    a.href          = blobUrl;
    a.download      = fileName;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// ─── FileAttachment ───────────────────────────────────────────────────────────

function FileAttachment({
    fileUrl,
    fileName,
    forMe,
}: {
    fileUrl  : string;
    fileName : string;
    forMe    : boolean;
}) {
    const ext        = fileName.split(".").pop()?.toLowerCase() ?? "";
    const isImage    = ["jpeg", "jpg", "png", "gif"].includes(ext);
    const canPreview = ["jpeg", "jpg", "png", "gif", "pdf", "mp4"].includes(ext);

    const { downloading, blobUrl, download } = useFileDownload();
    const [previewOpen, setPreviewOpen]      = useState(false);
    const [downloaded, setDownloaded]        = useState(false);

    const handleDownload = async () => {
        const url = await download(fileUrl, fileName);
        if (url) setDownloaded(true);
    };

    if (isImage) {
        return (
            <>
                <div className="mt-1 relative group w-fit">
                    <img
                        src={fileUrl}
                        alt={fileName}
                        className={`max-w-[220px] max-h-[180px] rounded-[10px] object-cover
                            border border-white/20 transition duration-300
                            ${!downloaded ? "blur-sm brightness-75 select-none pointer-events-none" : ""}`}
                    />
                    {!downloaded && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <button
                                onClick={handleDownload}
                                disabled={downloading}
                                className="bg-black/60 hover:bg-black/80 text-white rounded-full p-3 shadow-lg transition disabled:opacity-60"
                                title="Descarregar para ver"
                            >
                                {downloading
                                    ? <span className="block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    : <IoDownload className="text-xl" />
                                }
                            </button>
                        </div>
                    )}
                    {downloaded && (
                        <div className="absolute inset-0 rounded-[10px] bg-black/0 group-hover:bg-black/30
                                        transition flex items-center justify-center gap-2
                                        opacity-0 group-hover:opacity-100">
                            <button
                                onClick={() => setPreviewOpen(true)}
                                className="bg-white/90 hover:bg-white text-slate-700 rounded-full p-2 shadow transition"
                                title="Pré-visualizar"
                            >
                                <IoEye className="text-base" />
                            </button>
                            <button
                                onClick={handleDownload}
                                disabled={downloading}
                                className="bg-white/90 hover:bg-white text-slate-700 rounded-full p-2 shadow transition disabled:opacity-60"
                                title="Descarregar novamente"
                            >
                                <IoDownload className="text-base" />
                            </button>
                        </div>
                    )}
                </div>
                {previewOpen && blobUrl && (
                    <PreviewModal url={blobUrl} fileName={fileName} onClose={() => setPreviewOpen(false)} />
                )}
            </>
        );
    }

    return (
        <>
            <div className={`flex items-center gap-2 mt-1 px-3 py-2 rounded-[10px] text-[13px] font-medium
                ${forMe ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"}`}
            >
                <IoDocument className="text-lg flex-shrink-0" />
                <span className="truncate max-w-[130px]">{fileName}</span>
                <div className="ml-auto flex items-center gap-1 flex-shrink-0">
                    {canPreview && (
                        <button
                            onClick={() => downloaded && setPreviewOpen(true)}
                            disabled={!downloaded}
                            className={`p-1.5 rounded-full transition
                                ${!downloaded ? "opacity-30 cursor-not-allowed" : ""}
                                ${forMe ? "hover:bg-white/20 text-white" : "hover:bg-slate-300 text-slate-600"}`}
                            title={downloaded ? "Pré-visualizar" : "Descarrega primeiro"}
                        >
                            <IoEye className="text-base" />
                        </button>
                    )}
                    <button
                        onClick={handleDownload}
                        disabled={downloading}
                        className={`p-1.5 rounded-full transition disabled:opacity-60
                            ${forMe ? "hover:bg-white/20 text-white" : "hover:bg-slate-300 text-slate-600"}`}
                        title="Descarregar"
                    >
                        {downloading
                            ? <span className="block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            : <IoDownload className="text-base" />
                        }
                    </button>
                </div>
            </div>
            {previewOpen && blobUrl && (
                <PreviewModal url={blobUrl} fileName={fileName} onClose={() => setPreviewOpen(false)} />
            )}
        </>
    );
}

// ─── Menu de opções ───────────────────────────────────────────────────────────

function MessageMenu({
    forMe,
    onDelete,
}: {
    forMe    : boolean;
    onDelete : (scope: DeleteScope) => void;
}) {
    const [open, setOpen]       = useState(false);
    const [confirm, setConfirm] = useState<DeleteScope | null>(null);
    const ref                   = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
                setConfirm(null);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => { setOpen(o => !o); setConfirm(null); }}
                className={`p-0.5 rounded-full transition
                    opacity-0 group-hover:opacity-100
                    ${forMe
                        ? "text-white/70 hover:text-white hover:bg-white/20"
                        : "text-slate-400 hover:text-slate-600 hover:bg-slate-200"
                    }`}
                title="Opções"
            >
                <IoChevronDown className="text-sm" />
            </button>

            {open && (
                <div className={`absolute z-40 top-6 w-52 bg-white rounded-[12px] shadow-xl
                    border border-slate-100 overflow-hidden text-[13px]
                    ${forMe ? "right-0" : "left-0"}`}
                >
                    {confirm === null ? (
                        <div>
                            <button
                                onClick={() => setConfirm("for_me")}
                                className="w-full flex items-center gap-2.5 px-4 py-3 text-slate-700 hover:bg-slate-50 transition"
                            >
                                <IoTrash className="text-slate-400 flex-shrink-0" />
                                Apagar para mim
                            </button>
                            {forMe && (
                                <button
                                    onClick={() => setConfirm("for_everyone")}
                                    className="w-full flex items-center gap-2.5 px-4 py-3 text-red-600 hover:bg-red-50 transition border-t border-slate-100"
                                >
                                    <IoTrash className="text-red-400 flex-shrink-0" />
                                    Apagar para todos
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="p-4 flex flex-col gap-3">
                            <p className="text-slate-700 font-medium leading-snug">
                                {confirm === "for_everyone" ? "Apagar para todos?" : "Apagar só para ti?"}
                            </p>
                            <p className="text-[12px] text-slate-400 leading-snug">
                                {confirm === "for_everyone"
                                    ? "A mensagem será removida para todos os participantes."
                                    : "Só tu deixarás de ver esta mensagem."}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setConfirm(null)}
                                    className="flex-1 py-1.5 rounded-[8px] text-slate-500 bg-slate-100 hover:bg-slate-200 transition text-[12px]"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => { onDelete(confirm); setOpen(false); setConfirm(null); }}
                                    className="flex-1 py-1.5 rounded-[8px] text-white bg-red-500 hover:bg-red-600 transition text-[12px] font-medium"
                                >
                                    Apagar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── MessageBox ───────────────────────────────────────────────────────────────

export function MessageBox(props: I) {
    const { message, forMe, time, fileUrl, fileName, messageId, isRead, onDeleted } = props;

    const handleDelete = async (scope: DeleteScope) => {
        try {
            await apiChat.delete(
                `/messages/${messageId}/?for_everyone=${scope === "for_everyone"}`
            );
            onDeleted(messageId);
        } catch (err) {
            console.error("Erro ao apagar mensagem:", err);
        }
    };

    const content = (
        <>
            {fileUrl && fileName && (
                <FileAttachment fileUrl={fileUrl} fileName={fileName} forMe={forMe} />
            )}
            {message && (
                <span className={fileUrl ? "mt-1 block" : ""}>{message}</span>
            )}
            {/* Rodapé: hora + indicador de lido (só nas mensagens do emissor) */}
            <div className={`flex items-center gap-1 self-end mt-1 ${forMe ? "text-white/70" : "text-slate-400"}`}>
                <span className="text-[12px]">{time}</span>
                {forMe && <ReadIndicator isRead={isRead} />}
            </div>
        </>
    );

    // ── Mensagem recebida (esquerda) ──────────────────────────────────────────
    if (!forMe) {
        return (
            <div className="flex w-full justify-start px-4 py-2">
                <div className="relative group flex flex-col min-w-[90px] max-w-[70%]
                    rounded-[15px] p-3 bg-[#eef2f7] border border-slate-200 shadow-sm text-slate-700"
                >
                    <div className="absolute top-2 right-2">
                        <MessageMenu forMe={false} onDelete={handleDelete} />
                    </div>
                    <div className="pr-5">{content}</div>
                </div>
            </div>
        );
    }

    // ── Mensagem enviada (direita) ────────────────────────────────────────────
    return (
        <div className="flex w-full justify-end px-4 py-2">
            <div className="relative group flex flex-col min-w-[90px] max-w-[70%]
                rounded-[15px] p-3 bg-[#ec4348] shadow-sm text-white"
            >
                <div className="absolute top-2 right-2">
                    <MessageMenu forMe={true} onDelete={handleDelete} />
                </div>
                <div className="pr-5">{content}</div>
            </div>
        </div>
    );
}