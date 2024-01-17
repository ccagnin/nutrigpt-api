import { Injectable } from '@nestjs/common';
import { OpenAI, ClientOptions } from 'openai';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class MenuService {
  private readonly openAiApi: OpenAI;

  constructor(private prisma: PrismaService) {
    const configuration: ClientOptions = {
      organization: process.env.ORG_ID,
      apiKey: process.env.API_KEY,
    };

    this.openAiApi = new OpenAI(configuration);
  }

  async createUserMenu(userId: number) {
    // Verifique se o usuário e suas medidas existem
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const measures = await this.prisma.measure.findFirst({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!user || !measures) {
      throw new Error('Usuário ou medidas não encontrados');
    }

    // Crie o prompt para a API do OpenAI
    const prompt = this.createMenuPrompt(measures);

    // Gere o menu semanal e mapeie para o formato JSON
    const weeklyMenuText = await this.generateWeeklyMenu(prompt);
    const weeklyMenuJson = this.mapOpenAiResponseToMenu(weeklyMenuText);

    // Salve o menu no banco de dados
    const menu = await this.prisma.userMenu.create({
      data: {
        userId: userId,
        menu: weeklyMenuJson,
      },
    });

    return menu;
  }

  async updateMenu(userId: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      console.log(user);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const measures = await this.prisma.measure.findUnique({
        where: {
          userId,
        },
      });

      console.log(measures);

      if (!measures) {
        throw new NotFoundException('Measures not found for this user');
      }

      const prompt = this.createMenuPrompt(measures);
      console.log(prompt);

      const weeklyMenuText = await this.generateWeeklyMenu(prompt);
      const weeklyMenuJson = this.mapOpenAiResponseToMenu(weeklyMenuText);

      const currentDate = new Date();

      const existingUserMenu = await this.prisma.userMenu.findUnique({
        where: {
          userId: userId,
        },
      });

      if (existingUserMenu) {
        await this.prisma.userMenu.update({
          where: {
            userId: userId,
          },
          data: {
            menu: JSON.stringify(weeklyMenuJson),
            updatedAt: currentDate,
          },
        });
      } else {
        await this.prisma.userMenu.create({
          data: {
            user: {
              connect: {
                id: userId,
              },
            },
            menu: JSON.stringify(weeklyMenuJson),
          },
        });
      }
      console.log({ weeklyMenu: weeklyMenuJson });
      return { weeklyMenu: weeklyMenuJson };
    } catch (error) {
      throw error;
    }
  }

  async getMenu(userId: number) {
    try {
      const menu = await this.prisma.userMenu.findUnique({
        where: {
          userId,
        },
      });

      if (!menu) {
        throw new NotFoundException('Menu not found');
      }

      return { weeklyMenu: menu.menu };
    } catch (error) {
      throw error;
    }
  }

  private createMenuPrompt(measures: any): string {
    const userId = measures?.user?.id;
    const weight =
      measures.initWeight !== undefined
        ? measures.initWeight.toString()
        : 'undefined';
    const age =
      measures.age !== undefined ? measures.age.toString() : 'undefined';
    const height =
      measures.height !== undefined ? measures.height.toString() : 'undefined';
    const goal =
      measures.objective !== undefined
        ? measures.objective.toString()
        : 'undefined';

    console.log(weight, age, height, goal);

    return `crie um menu semanal para o usuário ${userId} com café da manhã, almoço e janta para cada dia da semana e os valores dos macros para cada refeição(carboidratos, proteínas e gordura), com altura: ${height}, peso: ${weight}, idade: ${age}, objetivo (0 para perda de peso, 1 para ganho de massa): ${goal}\n`;
  }

  private async generateWeeklyMenu(prompt: string): Promise<any> {
    try {
      const completion = await this.openAiApi.chat.completions.create(
        {
          messages: [{ role: 'user', content: prompt }],
          model: 'gpt-3.5-turbo',
        },
        {
          timeout: 600000,
        },
      );

      return {
        id: completion.id,
        message: completion.choices[0]?.message?.content,
        usage: completion.usage,
      };

      // if (!weeklyMenuText) {
      //   throw new Error('Weekly menu text is undefined or empty');
      // }

      // return weeklyMenuText;
    } catch (error) {
      console.error('Erro ao gerar o cardápio semanal:', error);
      throw new Error('Erro ao gerar o cardápio semanal');
    }
  }

  private mapOpenAiResponseToMenu(response: any): any {
    const days = response.message.split('\n\n');
    const weeklyMenu = {};

    days.forEach((day) => {
      const lines = day.split('\n');
      const dayName = lines[0].replace(':', '');
      const dayMeals = {};

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];

        if (line.startsWith('- ')) {
          const [title, description] = line.slice(2).split(': ');
          dayMeals[title.trim()] = description.trim();
        }
      }

      weeklyMenu[dayName.trim()] = dayMeals;
    });

    return { weeklyMenu };
  }
}
