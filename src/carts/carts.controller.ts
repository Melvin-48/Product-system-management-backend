import { Controller, Get, Post, Patch, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CartsService } from './carts.service';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Get()
  getCart(@Req() req: any) {
    return this.cartsService.getCart(req.user.userId);
  }

  @Post('items')
  addItem(@Req() req: any, @Body() dto: AddItemDto) {
    return this.cartsService.addItem(req.user.userId, dto.productId, dto.quantity);
  }

  @Patch('items/:productId')
  updateItem(@Req() req: any, @Param('productId') productId: string, @Body() dto: UpdateItemDto) {
    return this.cartsService.updateItem(req.user.userId, productId, dto.quantity);
  }

  @Delete('items/:productId')
  removeItem(@Req() req: any, @Param('productId') productId: string) {
    return this.cartsService.removeItem(req.user.userId, productId);
  }

  @Delete()
  clearCart(@Req() req: any) {
    return this.cartsService.clearCart(req.user.userId);
  }
}