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

      return { weeklyMenu };
    } catch (error) {
      throw new Error('Error generating the menu: ' + error.message);
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

    const meals = ['Café da manhã', 'Almoço', 'Jantar'];

    const prompt = `Crie um cardápio variado de 7 dias, para cada dia da semana, com café da manhã, almoço e janta, de acordo com as informações do usuário abaixo:
      Peso Inicial: ${measures.initWeight}
      Altura: ${measures.height}
      Idade: ${measures.age}
      Objetivo: ${measures.objective === 0 ? 'Perda de Peso' : 'Ganho de massa'}
      A resposta precisa estar em português do brasil e não podemos repetir a mesma comida todos os dias.\n\n`;

    const dailyMealsPrompt = daysOfWeek
      .map((day) => {
        const dayMeals = meals.map((meal) => `${meal}: `).join('\n');
        return `${day}\n${dayMeals}`;
      })
      .join('\n\n');

    return `${prompt}${dailyMealsPrompt}`;
  }

  private async generateWeeklyMenu(prompt: string): Promise<string> {
    try {
      const params = {
        prompt,
        max_tokens: 1500,
        temperature: 0.7,
        model: 'text-davinci-003',
      };

      const response = await this.openAiApi.completions.create(params);

      const weeklyMenuText = response.choices[0]?.text?.trim();

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
      const cafeDaManha = lines[1].split(':')[1].trim();
      const almoco = lines[2].split(':')[1].trim();
      const jantar = lines[3].split(':')[1].trim();

      return {
        day: dayName,
        cafeDaManha,
        almoco,
        jantar,
      };
    });

    return days;
  }
}
