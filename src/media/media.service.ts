import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { Media } from './entities/media.entity';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
  ) {}

  async create(createMediaDto: CreateMediaDto): Promise<Media> {
    const media = this.mediaRepository.create(createMediaDto);
    return this.mediaRepository.save(media);
  }

  async findOne(id: number): Promise<Media> {
    const media = await this.mediaRepository.findOne({ where: { id } });
    if (!media) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }
    return media;
  }

  async createMultiple(createMediaDtos: CreateMediaDto[]): Promise<Media[]> {
    const media = this.mediaRepository.create(createMediaDtos);
    return this.mediaRepository.save(media);
  }

  async findAllByBlogPostId(blogPostId: number): Promise<Media[]> {
    return this.mediaRepository.find({ where: { blogPostId } });
  }

  async update(id: number, updateMediaDto: UpdateMediaDto): Promise<Media> {
    await this.mediaRepository.update(id, updateMediaDto);
    const updatedMedia = await this.mediaRepository.findOne({ where: { id } });
    if (!updatedMedia) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }
    return updatedMedia;
  }

  async remove(id: number): Promise<DeleteResult> {
    const result = await this.mediaRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }
    return result;
  }

  async removeAllByBlogPostId(blogPostId: number): Promise<void> {
    await this.mediaRepository.delete({ blogPostId });
  }
}
