import {ILivroDTO} from "@/src/types";
import {MidiaProduct} from "@/src/domain/Midia/MidiaProduct.ts";
import {TipoDeMidia} from "@prisma/client";

export class LivroProduct extends MidiaProduct {
    private autor: string;
    private isbn: string;
    private paginas: number;

    constructor(dados: ILivroDTO) {
        super(dados);
        this.autor = dados.autor;
        this.isbn = dados.isbn ?? "";
        this.paginas = dados.paginas
    }

    public gravar(): any {
        return {
            tipo: "LIVRO" as TipoDeMidia,
            titulo: this.titulo,

            livro: {
                create: {
                    autor: this.autor,
                    isbn: this.isbn,
                    paginas: this.paginas,
                }
            }

        }
    }

    public atualizar(): any{
        return {
            tipo: this.tipo,
            titulo: this.titulo,

            livro: {
                update: {
                    autor: this.autor,
                    isbn: this.isbn,
                    paginas: this.paginas,
                }
            }

        }
    }
}