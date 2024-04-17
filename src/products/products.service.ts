import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { PrismaClient } from '@prisma/client'
import { PaginationDto } from 'src/common/dto/pagination.dto'
import { RpcException } from '@nestjs/microservices'

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('ProductsService')

  async onModuleInit() {
    await this.$connect()
    this.logger.log('Connected to the database')
  }
  async create(createProductDto: CreateProductDto) {
    return await this.product.create({ data: createProductDto })
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto

    const total = await this.product.count({ where: { available: true } })
    const lastPage = Math.ceil(total / limit)

    return {
      meta: {
        total,
        lastPage
      },
      data: await this.product.findMany({
        where: { available: true },
        skip: (page - 1) * limit,
        take: limit
      })
    }
  }

  async findOne(id: number) {
    const product = await this.product.findUnique({
      where: { id, available: true }
    })
    if (!product) {
      // * Restful way
      // throw new NotFoundException(`Product with id #${id} not found`)

      //* RPC way - Microservices
      throw new RpcException({
        message: `Product with id #${id} not found`,
        status: HttpStatus.BAD_REQUEST
      })
    }
    return product
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    await this.findOne(id)

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _, ...data } = updateProductDto

    return await this.product.update({
      where: { id },
      data
    })
  }

  async remove(id: number) {
    await this.findOne(id)

    // !HARD DELETE IS NOT RECOMMENDED, ESPECIALLY IN MICROSERVICES.
    // return await this.product.delete({ where: { id } })

    // * SOFT DELETE
    const product = await this.product.update({
      where: { id },
      data: { available: false }
    })

    return product
  }
}
