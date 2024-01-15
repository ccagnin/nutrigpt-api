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

  async createUserMenu(userId: number): Promise<{ weeklyMenu: any[] }> {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const measures = await this.prisma.measure.findUnique({
        where: {
          userId,
        },
      });

      if (!measures) {
        throw new NotFoundException('Measures not found for this user');
      }

      const prompt = this.createMenuPrompt(measures);

      const weeklyMenuText = await this.generateWeeklyMenu(prompt);
      const weeklyMenu = this.parseWeeklyMenu(weeklyMenuText);

      const userMenu = await this.prisma.userMenu.create({
        data: {
          user: {
            connect: {
              id: userId,
            },
          },
          menu: JSON.stringify(weeklyMenu),
        },
      });

      if (userMenu) {
        console.log('Menu created successfully');
      }

      return { weeklyMenu };
    } catch (error) {
      throw new Error('Error generating the menu: ' + error.message);
    }
  }

  async updateMenu(userId: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Obtenha as medidas do usuário novamente
      const measures = await this.prisma.measure.findUnique({
        where: {
          userId,
        },
      });

      if (!measures) {
        throw new NotFoundException('Measures not found for this user');
      }

      const prompt = this.createMenuPrompt(measures);

      const weeklyMenuText = await this.generateWeeklyMenu(prompt);
      const weeklyMenu = this.parseWeeklyMenu(weeklyMenuText);

      // Atualizar o cardápio no banco de dados
      const currentDate = new Date();
      await this.prisma.userMenu.update({
        where: {
          userId: userId,
        },
        data: {
          menu: JSON.stringify(this.parseWeeklyMenu(weeklyMenuText)),
          updatedAt: currentDate,
        },
      });

      return { weeklyMenu };
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

      return JSON.parse(menu.menu);
    } catch (error) {
      throw error;
    }
  }

  private createMenuPrompt(measures: any): string {
    const daysOfWeek = [
      'Segunda-feira',
      'Terça-feira',
      'Quarta-feira',
      'Quinta-feira',
      'Sexta-feira',
      'Sábado',
      'Domingo',
    ];

    const macro = ['Calorias', 'Proteína', 'Gordura', 'Carboidratos'];

    const meals = ['Café da manhã', 'Almoço', 'Jantar'];

    const prompt = `Crie um cardápio variado de 7 dias, para cada dia da semana, com café da manhã, almoço e janta, e em cada refeição exibir os macronutrientes, de acordo com as informações do usuário abaixo:
      Peso Inicial: ${measures.initWeight}
      Altura: ${measures.height}
      Idade: ${measures.age}
      Objetivo: ${measures.objective === 0 ? 'Perda de Peso' : 'Ganho de massa'}
      A resposta precisa estar em português do brasil e não podemos repetir a mesma comida todos os dias.\n\n`;

    const dailyMealsPrompt = daysOfWeek
      .map((day) => {
        const dayMeals = meals
          .map((meal) => {
            const mealPrompt = `${meal}: `;
            const macroPrompt = macro.map((macro) => `${macro}: `).join(', ');
            return `${mealPrompt}\n${macroPrompt}`;
          })
          .join('\n');
        return `${day}\n${dayMeals}`;
      })
      .join('\n\n');

    return `${prompt}${dailyMealsPrompt}`;
  }

  private async generateWeeklyMenu(prompt: string): Promise<string> {
    try {
      const params: OpenAI.ChatCompletionCreateParams = {
        model: 'gpt-4',
        messages: [{ role: 'assistant', content: prompt }],
      };

      console.log('API Request Params:', params);
      const response = await this.openAiApi.chat.completions.create(params);

      const weeklyMenuText = response.choices[0]?.message?.content?.trim();

      return weeklyMenuText;
    } catch (error) {
      console.error('Erro ao gerar o cardápio semanal:', error);
      throw new Error('Erro ao gerar o cardápio semanal');
    }
  }

  private parseWeeklyMenu(weeklyMenuText: string): any[] {
    const days = weeklyMenuText.split('\n\n').map((dayText) => {
      const lines = dayText.split('\n');
      const dayName = lines[0];
      const cafeDaManha = this.parseMeal(lines[1]);
      const almoco = this.parseMeal(lines[2]);
      const jantar = this.parseMeal(lines[3]);

      return {
        day: dayName,
        cafeDaManha,
        almoco,
        jantar,
      };
    });

    return days;
  }

  private parseMeal(mealText: string): any {
    const mealParts = mealText.split(':');
    const mealName = mealParts[0].trim();
    const macroPart = mealParts[1].trim();
    const macros = this.parseMacros(macroPart);

    return {
      meal: mealName,
      macros,
    };
  }

  private parseMacros(macroPart: string): any {
    const macroPairs = macroPart
      .split(',')
      .map((pair) => pair.trim().split(':'));
    const macros = {};

    for (const pair of macroPairs) {
      const [macroName, macroValue] = pair;
      macros[macroName] = parseFloat(macroValue);
    }

    return macros;
  }
}
