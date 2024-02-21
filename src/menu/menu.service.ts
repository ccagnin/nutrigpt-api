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
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      const measures = await this.prisma.measure.findFirst({
        where: { userId: userId },
        orderBy: { createdAt: 'desc' },
      });

      if (!user || !measures) {
        throw new Error('Usuário ou medidas não encontrados');
      }

      const prompt = this.createMenuPrompt(measures);
      console.log(prompt);

      const weeklyMenuText = await this.generateWeeklyMenu(prompt);
      console.log(weeklyMenuText);
      const menu = await this.prisma.userMenu.upsert({
        where: { userId: userId },
        update: { menu: weeklyMenuText },
        create: {
          userId: userId,
          menu: weeklyMenuText,
        },
      });

      console.log(menu);
      const json = this.mapOpenAiResponseToMenu(weeklyMenuText);
      console.log(json);

      return json;
    } catch (error) {
      throw error;
    }
  }

  // async updateMenu(userId: number) {
  //   try {
  //     const user = await this.prisma.user.findUnique({
  //       where: {
  //         id: userId,
  //       },
  //     });

  //     console.log(user);

  //     if (!user) {
  //       throw new NotFoundException('User not found');
  //     }

  //     const measures = await this.prisma.measure.findUnique({
  //       where: {
  //         userId,
  //       },
  //     });

  //     console.log(measures);

  //     if (!measures) {
  //       throw new NotFoundException('Measures not found for this user');
  //     }

  //     const prompt = this.createMenuPrompt(measures);
  //     console.log(prompt);

  //     const weeklyMenuText = await this.generateWeeklyMenu(prompt);
  //     // const weeklyMenuJson = this.mapOpenAiResponseToMenu(weeklyMenuText);

  //     const currentDate = new Date();

  //     const existingUserMenu = await this.prisma.userMenu.findUnique({
  //       where: {
  //         userId: userId,
  //       },
  //     });

  //     if (existingUserMenu) {
  //       await this.prisma.userMenu.update({
  //         where: {
  //           userId: userId,
  //         },
  //         data: {
  //           menu: JSON.stringify(weeklyMenuText),
  //           updatedAt: currentDate,
  //         },
  //       });
  //     } else {
  //       await this.prisma.userMenu.create({
  //         data: {
  //           user: {
  //             connect: {
  //               id: userId,
  //             },
  //           },
  //           menu: JSON.stringify(weeklyMenuJson),
  //         },
  //       });
  //     }
  //     console.log({ weeklyMenu: weeklyMenuJson });
  //     return { weeklyMenu: weeklyMenuJson };
  //   } catch (error) {
  //     throw error;
  //   }
  // }

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

      const parsedMenu = this.mapOpenAiResponseToMenu(menu.menu);

      if (!parsedMenu) return this.getMenu(userId);

      return { weeklyMenu: parsedMenu };
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

    return `crie um menu semanal para o usuário ${userId} com café da manhã, almoço e janta para cada dia da semana e os valores dos macros para cada refeição
    (carboidratos, proteínas e gordura), com altura: ${height}, peso: ${weight}, idade: ${age}, objetivo (0 para perda de peso, 1 para ganho de massa): ${goal}\n
    a resposta precisa estar padronizada no seguinte modelo (exemplo):
    "Segunda-feira:": {
      "Café da manhã": {
        "Ingredientes": "Vitamina de banana com aveia e whey protein",
        "Macros: {
          "Carboidratos": "30g",
          "Proteínas": "20g",
          "Gordura": "5g",
        }
      }
    }
    isso para todas as refeições.
      `;
  }

  async generateWeeklyMenu(prompt: string): Promise<string> {
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

      console.log(completion);

      if (completion.choices && completion.choices.length > 0) {
        const fullMessage = completion.choices[0]?.message?.content;

        return typeof fullMessage === 'string'
          ? fullMessage
          : JSON.stringify(fullMessage);
      }

      throw new Error('Conteúdo da resposta não encontrado');
    } catch (error) {
      console.error('Erro ao gerar o cardápio semanal:', error);
      throw new Error('Erro ao gerar o cardápio semanal');
    }
  }

  private mapOpenAiResponseToMenu(response: string): any {
    const menuObj = JSON.parse(response);

    const formattedMenu = {};

    for (const day in menuObj) {
      formattedMenu[day + ':'] = {};

      for (const meal in menuObj[day]) {
        formattedMenu[day + ':'][meal] = {
          Ingredientes: menuObj[day][meal]['Ingredientes'],
          'Macros:': {
            Carboidratos: menuObj[day][meal]['Macros']['Carboidratos'],
            Proteínas: menuObj[day][meal]['Macros']['Proteínas'],
            Gordura: menuObj[day][meal]['Macros']['Gordura'],
          },
        };
      }
    }

    return formattedMenu;
  }
}
