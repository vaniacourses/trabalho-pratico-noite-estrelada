import {ILivroDTO} from "@/src/types";
import {Midia} from "@/src/domain/Midia/Midia.ts";

export class Livro extends Midia {
    private autor: string;
    private isbn: string;
    private paginas: number;

    constructor(dados: ILivroDTO) {
        super(dados);
        this.autor = dados.autor;
        this.isbn = dados.isbn;
        this.paginas = dados.paginas
    }

    public getDados() {
        return {
            id: this.id,
            titulo: this.titulo,
            dataCriacao: this.dataCriacao,
            autor: this.autor,
            isbn: this.isbn,
            paginas: this.paginas
        }
    }

    public criar() {
        return MidiaService.criarLivro(this.getDados())
    }

    public atualizar() {
        return MidiaService.atualizarLivro(this.getDados())
    }
}