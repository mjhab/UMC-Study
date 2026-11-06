import { Controller, Get, Post, Body } from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto, BookResponseDto } from './book.dto';

@Controller('books')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Get()
  async getBooks(): Promise<BookResponseDto[]> {
    return this.bookService.getBooks();
  }

  @Post()
  async createBook(@Body() dto: CreateBookDto): Promise<BookResponseDto> {
    return this.bookService.createBook(dto);
  }
}