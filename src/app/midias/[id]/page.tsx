"use client"

import {useEffect, useState} from "react";
import {useParams} from "next/navigation";
import Link from "next/link";
import {Midia, TipoDeMidia} from "@prisma/client";
import {formatDate} from "@/src/utils/helpers.ts";
import {mediaTranslate} from "@/src/domain/translation.ts";
import {Button} from "@/src/components/ui/Button.tsx";

interface AlertState {
    show: boolean;
    message: string;
    tipo: 'sucesso' | 'erro';
}

export default function ViewMidiaPage() {
    const {id} = useParams();
    const [midiaResp, setMidiaResp] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [alert, setAlert] = useState<AlertState>({show: false, message: '', tipo: 'sucesso'});

    useEffect(() => {
        const message = sessionStorage.getItem('successMessage');
        if (message) {
            setAlert({show: true, message, tipo: 'sucesso'});
            sessionStorage.removeItem('successMessage');
        }
    }, []);

    useEffect(() => {
        if (!id) return;

        const fetchMidia = async () => {
            try {
                setIsLoading(true);
                const r = await fetch(`/api/midias/${id}`);
                const json = await r.json();
                if (!r.ok) {
                    setAlert({show: true, message: json.erro?.mensagem || 'Erro ao carregar mídia', tipo: 'erro'});
                } else {
                    setMidiaResp(json.dados);
                }
            } catch (e: any) {
                setAlert({show: true, message: e.message || 'Erro ao carregar mídia', tipo: 'erro'});
            } finally {
                setIsLoading(false);
            }
        };

        fetchMidia();
    }, [id]);

    if (isLoading) return (<main className="flex justify-center items-center min-h-screen">Carregando...</main>);

    if (!midiaResp) {
        return (
            <main className="p-6">
                {alert.show && (
                    <div
                        className={`mx-6 mb-4 p-4 rounded border-l-4 flex items-center justify-between ${alert.tipo === 'sucesso' ? `alert-success` : `alert-fail`}`}
                        role="alert">
                        <div className="flex items-center">
                            {alert.tipo === 'sucesso' ? <span className="mr-3 text-lg font-bold">✓</span> :
                                <span className="mr-3 text-lg font-bold">✕</span>}
                            <span>{alert.message}</span>
                        </div>
                        <button type="button"
                                className={`ml-4 text-lg font-bold hover:opacity-70 transition-opacity ${alert.tipo === 'sucesso' ? 'text-green-700' : 'text-red-700'}`}
                                onClick={() => setAlert(prev => ({...prev, show: false}))} aria-label="Close">×
                        </button>
                    </div>
                )}
                <div className="text-center text-gray-500">Mídia não encontrada.</div>
                <div className="mt-6 flex justify-center">
                    <Link href="/midias" className="btn btn-delete">Voltar à lista</Link>
                </div>
            </main>
        );
    }

    const midia: Midia = midiaResp as Midia;

    function renderData() {
        const dados: any = (midia as any).dados || {};
        switch (midia.tipo) {
            case "PUBLICACAO":
                return (
                    <div className="mt-2 space-y-2">
                        <div><strong>Autor:</strong> {dados.autor}</div>
                        <div><strong>ISBN:</strong> {dados.isbn}</div>
                        <div><strong>Páginas:</strong> {dados.paginas}</div>
                    </div>
                );
            case "CD":
                return (
                    <div className="mt-2 space-y-2">
                        <div><strong>Artista:</strong> {dados.artista}</div>
                        <div>
                            <strong>Faixas:</strong> {Array.isArray(dados.faixas) ? dados.faixas.join(', ') : dados.faixas}
                        </div>
                        <div><strong>Duração (min):</strong> {dados.duracao}</div>
                    </div>
                );
            case "DVD":
                return (
                    <div className="mt-2 space-y-2">
                        <div><strong>Diretor:</strong> {dados.diretor}</div>
                        <div><strong>Código de Região:</strong> {dados.codigoDeRegiao}</div>
                        <div>
                            <strong>Legendas:</strong> {Array.isArray(dados.legendas) ? dados.legendas.join(', ') : dados.legendas}
                        </div>
                        <div><strong>Duração (min):</strong> {dados.duracao}</div>
                    </div>
                );
            default:
                return null;
        }
    }

    return (
        <main className="grid  grid-cols-6 justify-center w-full mt-5">
            {alert.show && (
                <div
                    className={`mx-6 mb-4 p-4 rounded border-l-4 flex items-center justify-between ${alert.tipo === 'sucesso' ? `alert-success` : `alert-fail`}`}
                    role="alert">
                    <div className="flex items-center">
                        {alert.tipo === 'sucesso' ? <span className="mr-3 text-lg font-bold">✓</span> :
                            <span className="mr-3 text-lg font-bold">✕</span>}
                        <span>{alert.message}</span>
                    </div>
                    <button type="button"
                            className={`ml-4 text-lg font-bold hover:opacity-70 transition-opacity ${alert.tipo === 'sucesso' ? 'text-green-700' : 'text-red-700'}`}
                            onClick={() => setAlert(prev => ({...prev, show: false}))} aria-label="Close">×
                    </button>
                </div>
            )}

            <div className="bg-white rounded shadow mt-6 p-5 col-span-2 col-start-3">
            <h1 className="text-2xl font-bold mb-4">{midia.titulo}</h1>

                <div className={"p-5"}>

                    <div className={"mb-2"}><strong>Tipo:</strong> {mediaTranslate[midia.tipo as TipoDeMidia]}</div>

                    <div><strong className={"mb-2"}>Data de Criação:</strong> {formatDate(midia.dataCriacao)}</div>

                    <div className={"mb-2"}>
                        {renderData()}
                    </div>
                </div>

                <div className="mt-6 flex justify-around">
                    <Link href="/midias" className="btn btn-delete">
                        <Button>
                            Voltar
                        </Button>
                    </Link>
                    <Link href={`/midias/${midia.id}/edit`} className="btn-edit">
                        <Button>
                            Editar
                        </Button>
                    </Link>
                </div>
            </div>
        </main>
    );
}


