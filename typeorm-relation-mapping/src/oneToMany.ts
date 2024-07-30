import { AppDataSource } from './data-source';
import { Department } from './entity/Department';
import { Employee } from './entity/Employee';
// 一对一的关系
AppDataSource.initialize()
  .then(async () => {
    console.log('Inserting a new user into the database...');
    // const d = new Department();
    // d.name = '后端部门';
    // const es = generateEmployee(['孙武', '周五', '吴用', '郑王']);
    // d.employees = es;
    // const ees = es.map(item => {
    //   item.department = d;
    //   return item;
    // });

    // await AppDataSource.manager.getRepository(Department).save(d);
    // await AppDataSource.manager.getRepository(Employee).save(ees);
    // ------------
    const dps = await AppDataSource.manager.find(Department);
    const dpsCas = await AppDataSource.manager.find(Department, {
      relations: {
        employees: true,
      },
    });
    console.log('dps', dps);
    console.log('dpsCas', dpsCas);
    console.log(
      'emps',
      dpsCas.map((item) => item.employees)
    );
    console.log(
      '员工查询部门',
      await AppDataSource.manager
        .getRepository(Employee)
        .createQueryBuilder('e')
        .leftJoinAndSelect('e.department', 'd')
        .getMany()
    );
  })
  .catch((error) => console.log(error));

function generateEmployee(names: string | string[]) {
  let arr = names;
  if (typeof names === 'string') {
    arr = [names];
  }
  return (arr as string[]).map((name) => {
    const o = new Employee();
    o.name = name;
    return o;
  });
}
